"""Cobrinha que cresce: anima o gráfico de contribuições no tema Violet Frost.

A cobrinha percorre o gráfico, come cada dia com contribuições e cresce
de acordo com a intensidade daquele dia. Tudo é feito com SMIL dentro do
SVG (sem JavaScript), então funciona como <img> no README.

Roda no GitHub Actions e grava snake-dark.svg e snake-light.svg em dist/.

Uso: GITHUB_TOKEN=... python scripts/snake.py <usuario> <pasta_saida>
     python scripts/snake.py --demo <pasta_saida>   (dados de exemplo)
"""
import json
import os
import random
import sys
import urllib.request

CELULA = 12          # lado do quadradinho
PASSO = 15           # célula + espaço
MARGEM = 16
COMP_INICIAL = 3     # comprimento inicial, em células
CRESC_MAX = 32       # crescimento total máximo, em células
SEG_POR_PASSO = 0.11 # duração de cada passo, em segundos
DURACAO_MAX = 80.0   # se o caminho for longo, acelera para caber aqui
PAUSA_FINAL = 2.5

TEMAS = {
    "dark": dict(fundo="#14131c", vazio="#1c1a26", niveis=["#322c46", "#5d4d8c", "#8a6cc8", "#c4a7ff"],
                 corpo="#a884e8", cabeca="#c4a7ff", olho="#14131c", borda="#211e2e"),
    "light": dict(fundo="#f6f5fa", vazio="#ebe9f2", niveis=["#d5ccef", "#b49af5", "#8a6cc8", "#5d4d8c"],
                  corpo="#7b5cc4", cabeca="#5d4d8c", olho="#f6f5fa", borda="#e2dfec"),
}
NIVEL = {"NONE": 0, "FIRST_QUARTILE": 1, "SECOND_QUARTILE": 2, "THIRD_QUARTILE": 3, "FOURTH_QUARTILE": 4}

QUERY = """
query($login: String!) {
  user(login: $login) {
    contributionsCollection {
      contributionCalendar {
        totalContributions
        weeks { contributionDays { weekday contributionLevel contributionCount } }
      }
    }
  }
}"""


def buscar(login, token):
    req = urllib.request.Request(
        "https://api.github.com/graphql",
        data=json.dumps({"query": QUERY, "variables": {"login": login}}).encode(),
        headers={"Authorization": f"bearer {token}", "Content-Type": "application/json"},
    )
    with urllib.request.urlopen(req, timeout=30) as r:
        dados = json.load(r)
    if "errors" in dados:
        raise SystemExit(f"Erro da API: {dados['errors']}")
    cal = dados["data"]["user"]["contributionsCollection"]["contributionCalendar"]
    celulas = {}
    for x, semana in enumerate(cal["weeks"]):
        for dia in semana["contributionDays"]:
            celulas[(x, dia["weekday"])] = NIVEL.get(dia["contributionLevel"], 0)
    return len(cal["weeks"]), celulas, cal["totalContributions"]


def demo():
    rnd = random.Random(7)
    celulas = {}
    for x in range(53):
        for y in range(7):
            r = rnd.random()
            celulas[(x, y)] = 0 if r < 0.82 else rnd.choice([1, 1, 2, 2, 3, 4])
    return 53, celulas, 0


DIRECOES = [(1, 0), (0, 1), (0, -1), (-1, 0)]  # direita, baixo, cima, esquerda


Y_MIN, Y_MAX = -1, 7  # uma linha de folga acima e abaixo do gráfico


def _dentro(p, semanas):
    return -3 <= p[0] <= semanas + 1 and Y_MIN <= p[1] <= Y_MAX


def _busca(inicio, direcao, alvos_ok, bloqueadas, semanas, por_posicao=True, max_alvos=8):
    """BFS sobre (posição, direção): sem meia-volta e sem passar pelas células bloqueadas.
    Com por_posicao, cada célula entra no trecho uma vez só (não cruza o próprio rastro).
    Devolve até max_alvos trechos, do alvo mais perto para o mais longe."""
    from collections import deque
    fila = deque([(inicio, direcao)])
    pai = {(inicio, direcao): None}
    vistas = {inicio}
    achados, trechos = set(), []
    while fila and len(trechos) < max_alvos:
        estado = fila.popleft()
        pos, d = estado
        if pos != inicio and pos in alvos_ok and pos not in achados:
            achados.add(pos)
            trecho, e = [], estado
            while e is not None:
                trecho.append(e[0])
                e = pai[e]
            trechos.append(trecho[::-1][1:])
            continue  # não passa por cima de um alvo para chegar em outro
        # seguir reto primeiro deixa o movimento mais suave
        for nd in [d] + [x for x in DIRECOES if x != d]:
            if nd == (-d[0], -d[1]):
                continue  # meia-volta é proibida, como no jogo
            np_ = (pos[0] + nd[0], pos[1] + nd[1])
            if not _dentro(np_, semanas) or np_ in bloqueadas:
                continue
            e = (np_, nd)
            if por_posicao:
                if np_ in vistas:
                    continue
                vistas.add(np_)
            if e not in pai:
                pai[e] = estado
                fila.append(e)
    return trechos


def _tem_saida(trilha, n_corpo, semanas):
    """Depois de comer, a cabeça ainda alcança espaço livre suficiente para continuar?"""
    corpo = set(trilha[-n_corpo:-1])
    cabeca = trilha[-1]
    vistos, pilha = {cabeca}, [cabeca]
    precisa = n_corpo + 8
    while pilha:
        x, y = pilha.pop()
        for dx, dy in DIRECOES:
            q = (x + dx, y + dy)
            if q not in vistos and q not in corpo and _dentro(q, semanas):
                vistos.add(q)
                if len(vistos) >= precisa:
                    return True
                pilha.append(q)
    return False


def caminho(semanas, celulas):
    """Lista de posições (x, y), passo a passo, o passo em que cada alvo é comido
    e o comprimento da cobrinha depois de cada refeição."""
    alvos = {p for p, n in celulas.items() if n > 0}
    soma = sum(celulas[a] for a in alvos) or 1
    fator = min(1.0, CRESC_MAX / soma)
    comp = [COMP_INICIAL]
    pos, direcao = (-2, 3), (1, 0)
    trilha = [pos]
    comidos = []
    while alvos:
        # janela: só alvos a poucas semanas da coluna mais à esquerda que falta,
        # para seguir da esquerda para a direita sem deixar nada para trás
        limite = min(a[0] for a in alvos) + 3
        janela = {a for a in alvos if a[0] <= limite}
        # o corpo atual (sem a ponta do rabo, que vai andar) é obstáculo
        n_corpo = int(comp[-1] + 0.999)
        corpo = set(trilha[-n_corpo:-1]) if n_corpo > 1 else set()
        trecho = None
        for conjunto in (janela, alvos):
            for t in _busca(pos, direcao, conjunto, corpo, semanas):
                n_depois = int(comp[-1] + celulas[t[-1]] * fator + 0.999)
                if _tem_saida(trilha + t, n_depois, semanas):
                    trecho = t
                    break
            if trecho:
                break
        if not trecho:  # sem opção segura: aceita a melhor que houver
            opcoes = (_busca(pos, direcao, alvos, corpo, semanas)
                      or _busca(pos, direcao, alvos, corpo, semanas, por_posicao=False)
                      or _busca(pos, direcao, alvos, set(), semanas, por_posicao=False))
            if not opcoes:
                break
            trecho = opcoes[0]
        for p in trecho:
            direcao = (p[0] - trilha[-1][0], p[1] - trilha[-1][1])
            trilha.append(p)
        pos = trilha[-1]
        alvos.discard(pos)
        comidos.append((len(trilha) - 1, pos))
        comp.append(comp[-1] + celulas[pos] * fator)
    return trilha, comidos, comp


def centro(p):
    return MARGEM + p[0] * PASSO + CELULA / 2, MARGEM + p[1] * PASSO + CELULA / 2


def gerar(semanas, celulas, tema):
    t = TEMAS[tema]
    trilha, comidos, comp = caminho(semanas, celulas)
    comp_final = comp[-1]

    # saída: segue para a direita até sumir por completo
    x, y = trilha[-1]
    if len(trilha) > 1 and trilha[-1][0] < trilha[-2][0]:
        # vinha para a esquerda: vira para cima ou para baixo antes, sem meia-volta
        y += 1 if y < Y_MAX else -1
        trilha.append((x, y))
    fim_x = semanas + 2 + int(comp_final) + 2
    while x < fim_x:
        x += 1
        trilha.append((x, y))

    passos = len(trilha) - 1
    seg = min(SEG_POR_PASSO, DURACAO_MAX / max(passos, 1))
    viagem = passos * seg
    total = viagem + PAUSA_FINAL

    def kt(passo):  # passo -> keyTime
        return passo * seg / total

    # só os cantos entram no path
    pontos = [trilha[0]]
    for i in range(1, len(trilha) - 1):
        a, b, c = trilha[i - 1], trilha[i], trilha[i + 1]
        if (b[0] - a[0], b[1] - a[1]) != (c[0] - b[0], c[1] - b[1]):
            pontos.append(b)
    pontos.append(trilha[-1])
    d = "M" + " L".join(f"{centro(p)[0]:.1f},{centro(p)[1]:.1f}" for p in pontos)
    comprimento_total = passos * PASSO
    gap = comprimento_total + 2000

    # quadros-chave do corpo: posição da cabeça s e comprimento L
    quadros = [(0.0, 0.0, comp[0] * PASSO)]
    for k, (passo, _) in enumerate(comidos):
        L_antes, L_depois = comp[k] * PASSO, comp[k + 1] * PASSO
        quadros.append((kt(passo), passo * PASSO, L_antes))
        p2 = min(passo + 2, passos)
        if kt(p2) > quadros[-1][0]:
            quadros.append((kt(p2), p2 * PASSO, L_depois))
    quadros.append((kt(passos), comprimento_total, comp_final * PASSO))
    quadros.append((1.0, comprimento_total, comp_final * PASSO))
    # keyTimes precisam ser estritamente crescentes
    limpos = []
    for q in quadros:
        if limpos and q[0] <= limpos[-1][0]:
            q = (limpos[-1][0] + 1e-5, q[1], q[2])
        limpos.append(q)
    limpos[-1] = (1.0, limpos[-1][1], limpos[-1][2])
    kts = ";".join(f"{q[0]:.5f}" for q in limpos)
    dash = ";".join(f"{q[2]:.1f} {gap:.0f}" for q in limpos)
    offs = ";".join(f"{q[2] - q[1]:.1f}" for q in limpos)

    largura = MARGEM * 2 + semanas * PASSO - (PASSO - CELULA)
    altura = MARGEM * 2 + 7 * PASSO - (PASSO - CELULA)
    dur = f"{total:.2f}s"

    out = [f'<svg xmlns="http://www.w3.org/2000/svg" width="{largura}" height="{altura}" '
           f'viewBox="0 0 {largura} {altura}" role="img" '
           f'aria-label="Cobrinha que cresce enquanto come o gráfico de contribuições">',
           f'<rect width="{largura}" height="{altura}" rx="10" fill="{t["fundo"]}"/>']
    # grade vazia
    for gx in range(semanas):
        for gy in range(7):
            if (gx, gy) in celulas:
                out.append(f'<rect x="{MARGEM + gx * PASSO}" y="{MARGEM + gy * PASSO}" width="{CELULA}" '
                           f'height="{CELULA}" rx="2.5" fill="{t["vazio"]}"/>')
    # contribuições, que somem quando comidas
    for passo, (cx, cy) in comidos:
        n = celulas[(cx, cy)]
        k = kt(passo)
        out.append(f'<rect x="{MARGEM + cx * PASSO}" y="{MARGEM + cy * PASSO}" width="{CELULA}" height="{CELULA}" '
                   f'rx="2.5" fill="{t["niveis"][n - 1]}"><animate attributeName="opacity" dur="{dur}" '
                   f'repeatCount="indefinite" calcMode="discrete" values="1;0;1" '
                   f'keyTimes="0;{k:.5f};{max(k + 1e-5, 1 - 1e-5):.5f}"/></rect>')
    # corpo
    out.append(f'<path d="{d}" fill="none" stroke="{t["corpo"]}" stroke-width="10" stroke-linecap="round" '
               f'stroke-linejoin="round" stroke-dasharray="{limpos[0][2]:.1f} {gap:.0f}" '
               f'stroke-dashoffset="{limpos[0][2]:.1f}">'
               f'<animate attributeName="stroke-dasharray" dur="{dur}" repeatCount="indefinite" '
               f'keyTimes="{kts}" values="{dash}"/>'
               f'<animate attributeName="stroke-dashoffset" dur="{dur}" repeatCount="indefinite" '
               f'keyTimes="{kts}" values="{offs}"/></path>')
    # cabeça com olhos, girando conforme a direção
    out.append(f'<g><circle r="6.5" fill="{t["cabeca"]}"/>'
               f'<circle cx="2.2" cy="-2.4" r="1.3" fill="{t["olho"]}"/>'
               f'<circle cx="2.2" cy="2.4" r="1.3" fill="{t["olho"]}"/>'
               f'<animateMotion dur="{dur}" repeatCount="indefinite" rotate="auto" calcMode="linear" '
               f'keyPoints="0;1;1" keyTimes="0;{kt(passos):.5f};1" path="{d}"/></g>')
    out.append("</svg>")
    return "\n".join(out)


def main():
    if len(sys.argv) == 3 and sys.argv[1] == "--demo":
        saida = sys.argv[2]
        semanas, celulas, total = demo()
    else:
        login, saida = sys.argv[1], sys.argv[2]
        semanas, celulas, total = buscar(login, os.environ["GITHUB_TOKEN"])
    os.makedirs(saida, exist_ok=True)
    for tema in TEMAS:
        with open(os.path.join(saida, f"snake-{tema}.svg"), "w", encoding="utf-8") as f:
            f.write(gerar(semanas, celulas, tema))
    print(f"ok: {semanas} semanas, {sum(1 for n in celulas.values() if n)} dias com contribuição")


if __name__ == "__main__":
    main()
