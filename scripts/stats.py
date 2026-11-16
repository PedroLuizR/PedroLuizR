"""Gera os cards de estatísticas do perfil no tema Violet Frost.

Roda no GitHub Actions (workflow snake.yml) e grava os SVGs em dist/,
que é publicado no branch `output`. Usa só a biblioteca padrão.

Uso: GITHUB_TOKEN=... python scripts/stats.py <usuario> <pasta_saida>
     python scripts/stats.py --demo <pasta_saida>   (dados de exemplo)
"""
import html
import json
import os
import sys
import urllib.request

C = dict(bg="#14131c", chrome="#100f16", border="#211e2e", c0="#23202f", c8="#3d3752",
         fg="#cbc7da", fgb="#eae7f2", com="#736d92", punc="#8a85a3", acc="#a884e8",
         acc2="#c4a7ff", cyan="#6fb2c6", teal="#78b8a4", blue2="#9db3f0", sand="#c3b183", pink="#d1698f")
CORES_LING = [C["acc"], C["cyan"], C["teal"], C["blue2"], C["sand"], C["pink"]]
MONO = "'JetBrainsMono Nerd Font','JetBrains Mono',ui-monospace,SFMono-Regular,Menlo,Consolas,monospace"
SANS = "ui-sans-serif,system-ui,-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif"
W, H = 424, 196

QUERY = """
query($login: String!) {
  user(login: $login) {
    followers { totalCount }
    pullRequests { totalCount }
    repositories(ownerAffiliations: OWNER, isFork: false, privacy: PUBLIC, first: 100) {
      totalCount
      nodes {
        stargazerCount
        languages(first: 10, orderBy: {field: SIZE, direction: DESC}) {
          edges { size node { name } }
        }
      }
    }
    contributionsCollection {
      totalCommitContributions
      totalPullRequestContributions
      totalIssueContributions
      contributionCalendar { totalContributions }
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
    u = dados["data"]["user"]
    cc = u["contributionsCollection"]
    langs = {}
    for repo in u["repositories"]["nodes"]:
        for e in repo["languages"]["edges"]:
            langs[e["node"]["name"]] = langs.get(e["node"]["name"], 0) + e["size"]
    return {
        "contrib": cc["contributionCalendar"]["totalContributions"],
        "commits": cc["totalCommitContributions"],
        "prs": u["pullRequests"]["totalCount"],
        "issues": cc["totalIssueContributions"],
        "repos": u["repositories"]["totalCount"],
        "estrelas": sum(r["stargazerCount"] for r in u["repositories"]["nodes"]),
        "langs": langs,
    }


def janela(aba, corpo, rotulo, estilo=""):
    tw = len(aba) * 7.6 + 34
    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}" role="img" aria-label="{html.escape(rotulo)}">
<style>
text{{font-family:{MONO};font-weight:500;white-space:pre}}
.f{{opacity:0;animation:in .35s ease-out forwards}}@keyframes in{{to{{opacity:1}}}}
{estilo}
@media (prefers-reduced-motion:reduce){{.f{{animation:none;opacity:1}}}}
</style>
<rect x=".5" y=".5" width="{W-1}" height="{H-1}" rx="10" fill="{C["bg"]}" stroke="{C["border"]}"/>
<path d="M10.5 .5h{W-21}a10 10 0 0 1 10 10V34H.5V10.5a10 10 0 0 1 10-10z" fill="{C["chrome"]}"/>
<line x1="1" y1="34" x2="{W-1}" y2="34" stroke="{C["border"]}"/>
<rect x="8" y="6" width="{tw:.0f}" height="22" rx="4" fill="{C["acc"]}"/>
<text x="20" y="21.5" font-size="11.5" fill="{C["bg"]}" font-weight="700">1 {html.escape(aba)}</text>
{corpo}
</svg>'''


def card_stats(d):
    linhas = [
        ("contribuições", d["contrib"], C["acc2"], "no último ano"),
        ("commits", d["commits"], C["acc"], "no último ano"),
        ("pull requests", d["prs"], C["cyan"], "no total"),
        ("repositórios", d["repos"], C["teal"], "públicos"),
        ("estrelas", d["estrelas"], C["sand"], "recebidas"),
    ]
    corpo = f'<text x="20" y="60" font-size="11.5" fill="{C["com"]}">$ git stats --user PedroLuizR</text>'
    for i, (k, v, cor, nota) in enumerate(linhas):
        y = 88 + i * 22
        corpo += (f'<text class="f" style="animation-delay:{.1 + i * .08:.2f}s" x="20" y="{y}" font-size="13">'
                  f'<tspan fill="{C["punc"]}">{k}</tspan>'
                  f'<tspan x="190" text-anchor="end" fill="{cor}" font-weight="700">{v}</tspan>'
                  f'<tspan x="206" fill="{C["com"]}">{nota}</tspan></text>')
    rot = ", ".join(f"{v} {k}" for k, v, _, _ in linhas)
    return janela("stats", corpo, f"Estatísticas do GitHub: {rot}")


def card_langs(langs):
    total = sum(langs.values()) or 1
    top = sorted(langs.items(), key=lambda x: -x[1])[:6]
    corpo = f'<text x="20" y="60" font-size="11.5" fill="{C["com"]}">$ linguagens --top 6</text>'
    # barra empilhada
    x, bw = 20, W - 40
    corpo += f'<rect x="20" y="72" width="{bw}" height="8" rx="4" fill="{C["c0"]}"/>'
    corpo += '<clipPath id="b"><rect x="20" y="72" width="%d" height="8" rx="4"/></clipPath><g clip-path="url(#b)">' % bw
    for i, (nome, tam) in enumerate(top):
        w = bw * tam / total
        corpo += f'<rect class="g" style="animation-delay:{i * .1:.1f}s" x="{x:.1f}" y="72" width="{w + .5:.1f}" height="8" fill="{CORES_LING[i]}"/>'
        x += w
    corpo += "</g>"
    for i, (nome, tam) in enumerate(top):
        col, lin = divmod(i, 3)
        cx, cy = 20 + col * 196, 112 + lin * 26
        corpo += (f'<g class="f" style="animation-delay:{.3 + i * .08:.2f}s">'
                  f'<rect x="{cx}" y="{cy - 9}" width="10" height="10" rx="2" fill="{CORES_LING[i]}"/>'
                  f'<text x="{cx + 18}" y="{cy}" font-size="13" fill="{C["fg"]}">{html.escape(nome)}'
                  f'<tspan fill="{C["com"]}"> {100 * tam / total:.1f}%</tspan></text></g>')
    rot = ", ".join(f"{n} {100 * t / total:.1f}%" for n, t in top)
    estilo = (".g{transform-box:fill-box;transform-origin:left;transform:scaleX(0);animation:gr .5s ease-out forwards}"
              "@keyframes gr{to{transform:scaleX(1)}}@media (prefers-reduced-motion:reduce){.g{animation:none;transform:none}}")
    return janela("linguagens", corpo, f"Linguagens mais usadas: {rot}", estilo)


def main():
    if len(sys.argv) == 3 and sys.argv[1] == "--demo":
        saida = sys.argv[2]
        d = {"contrib": 412, "commits": 356, "prs": 18, "issues": 3, "repos": 13, "estrelas": 7,
             "langs": {"Java": 52000, "TypeScript": 41000, "JavaScript": 15000, "HTML": 12000,
                       "CSS": 9000, "Python": 3000, "Lua": 2000}}
    else:
        login, saida = sys.argv[1], sys.argv[2]
        d = buscar(login, os.environ["GITHUB_TOKEN"])
    os.makedirs(saida, exist_ok=True)
    with open(os.path.join(saida, "stats.svg"), "w", encoding="utf-8") as f:
        f.write(card_stats(d))
    with open(os.path.join(saida, "langs.svg"), "w", encoding="utf-8") as f:
        f.write(card_langs(d["langs"]))
    print("ok:", {k: v for k, v in d.items() if k != "langs"})


if __name__ == "__main__":
    main()
