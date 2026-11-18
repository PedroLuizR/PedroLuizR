import Svg, { Path } from 'react-native-svg';
import type { ClosetItemKind } from '../../data/mock';
import { colors } from '../../theme/tokens';

/** Ícones das roupinhas extraídos do mockup (projeto_paw_paleta1.svg). */
type P = { d: string; fill?: keyof typeof colors; stroke?: keyof typeof colors; strokeWidth?: number; strokeLinecap?: 'round'; strokeLinejoin?: 'round' };

const ICONS: Record<ClosetItemKind, { viewBox: string; paths: P[] }> = {
  moletom: {
    viewBox: '1434.7 635.7 66.7 66.7',
    paths: [
      { d: 'M1454 657L1446 660L1437 675C1436.33 676.333 1436.67 677.333 1438 678L1446 682C1447.33 682.667 1448.33 682.333 1449 681L1453 674L1452 694C1452 696 1453 697 1455 697H1481C1483 697 1484 696 1484 694L1483 674L1487 681C1487.67 682.333 1488.67 682.667 1490 682L1498 678C1499.33 677.333 1499.67 676.333 1499 675L1490 660L1482 657H1454Z', fill: 'sageGreen', stroke: 'primary', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round' },
      { d: 'M1452 659C1451 647 1457 641 1468 641C1479 641 1485 647 1484 659L1475 666H1461L1452 659Z', fill: 'border', stroke: 'primary', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round' },
      { d: 'M1457 657C1457 649 1461 645 1468 645C1475 645 1479 649 1479 657L1468 664L1457 657Z', fill: 'sageDark', stroke: 'primary', strokeWidth: 1.4, strokeLinecap: 'round', strokeLinejoin: 'round' },
      { d: 'M1460 677H1476L1479 686C1479 688 1478 689 1476 689H1460C1458 689 1457 688 1457 686L1460 677Z', fill: 'border', stroke: 'primary', strokeWidth: 1.4, strokeLinecap: 'round', strokeLinejoin: 'round' },
      { d: 'M1460 677L1463 682M1476 677L1473 682M1453 692H1483M1439 674L1448 679M1488 679L1497 674', stroke: 'primary', strokeWidth: 1.2, strokeLinecap: 'round', strokeLinejoin: 'round' },
    ],
  },
  bandana: {
    viewBox: '1564.6 641.0 56.7 56.7',
    paths: [
      { d: 'M1569 656C1576.33 654.667 1583.33 653.333 1590 652C1592 651.333 1594 651.333 1596 652C1602.67 653.333 1609.67 654.667 1617 656C1618.33 656 1618.5 657 1617.5 659L1595.5 694C1593.83 696.333 1592.17 696.333 1590.5 694L1568.5 659C1567.5 657 1567.67 656 1569 656Z', fill: 'sunYellow', stroke: 'primary', strokeWidth: 1.8, strokeLinejoin: 'round' },
      { d: 'M1593 655C1595.67 662.333 1596.33 670 1595 678L1593 692C1600.33 678.667 1607 667.667 1613 659C1605.67 659 1599 657.667 1593 655Z', fill: 'sunDark' },
      { d: 'M1576 660C1581.33 659.333 1585.67 658 1589 656', stroke: 'primary', strokeWidth: 1.4, strokeLinecap: 'round' },
      { d: 'M1591 650C1585.67 650 1582.33 648.333 1581 645C1580.33 643.667 1581 643 1583 643C1588.33 643 1592 645 1594 649L1591 650Z', fill: 'sunYellow', stroke: 'primary', strokeWidth: 1.8, strokeLinejoin: 'round' },
      { d: 'M1594 649C1597.33 645 1601 643.333 1605 644C1606.33 644 1606.67 645 1606 647C1604 651 1600.67 653 1596 653L1594 649Z', fill: 'sunYellow', stroke: 'primary', strokeWidth: 1.8, strokeLinejoin: 'round' },
      { d: 'M1590 648C1592 646.667 1594 647 1596 649L1598 653C1596 655 1593.67 655.667 1591 655L1589 652L1590 648Z', fill: 'sunDark', stroke: 'primary', strokeWidth: 1.8, strokeLinejoin: 'round' },
    ],
  },
  capa: {
    viewBox: '1682.7 633.2 70.7 70.7',
    paths: [
      { d: 'M1706 659C1700 660 1696 663 1692 669L1685 679C1684.33 680.333 1684.67 681.333 1686 682L1696 687C1697.33 687.667 1698.33 687.333 1699 686L1703 679L1702 694C1702 696.667 1703.67 698 1707 698H1729C1732.33 698 1734 696.667 1734 694L1733 679L1737 686C1737.67 687.333 1738.67 687.667 1740 687L1750 682C1751.33 681.333 1751.67 680.333 1751 679L1744 669C1740 663 1736 660 1730 659H1706Z', fill: 'terracotta', stroke: 'primary', strokeWidth: 1.6, strokeLinejoin: 'round' },
      { d: 'M1705 663C1701 659 1701 653 1704 647C1707 641 1712 639 1718 639C1724 639 1729 641 1732 647C1735 653 1735 659 1731 663L1723 668H1713L1705 663Z', fill: 'terracottaLight', stroke: 'primary', strokeWidth: 1.6, strokeLinejoin: 'round' },
      { d: 'M1707 659C1706 655 1708 650 1711 647C1715 644 1721 644 1725 647C1728 650 1730 655 1729 659L1721 665H1715L1707 659Z', fill: 'terracottaDark', stroke: 'primary', strokeWidth: 1.4, strokeLinejoin: 'round' },
      { d: 'M1707 659L1718 664L1729 659L1726 667L1718 670L1710 667L1707 659Z', fill: 'terracottaLight', stroke: 'primary', strokeWidth: 1.4, strokeLinejoin: 'round' },
      { d: 'M1718 670V695M1688 678L1698 683M1738 683L1748 678', stroke: 'primary', strokeWidth: 1.4, strokeLinecap: 'round' },
      { d: 'M1716 670H1720V676H1716V670Z', fill: 'terracottaHighlight', stroke: 'primary', strokeWidth: 1.2, strokeLinejoin: 'round' },
    ],
  },
};

export function ClothingIcon({ kind, size = 48 }: { kind: ClosetItemKind; color?: string; size?: number }) {
  const icon = ICONS[kind];
  return (
    <Svg width={size} height={size} viewBox={icon.viewBox}>
      {icon.paths.map((p, i) => (
        <Path
          key={i}
          d={p.d}
          fill={p.fill ? colors[p.fill] : 'none'}
          stroke={p.stroke ? colors[p.stroke] : undefined}
          strokeWidth={p.strokeWidth}
          strokeLinecap={p.strokeLinecap}
          strokeLinejoin={p.strokeLinejoin}
        />
      ))}
    </Svg>
  );
}
