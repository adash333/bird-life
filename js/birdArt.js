// 鳥の絵（SVG）。成長段階ごとに描き分ける。
function birdSvg(b, small = false) {
  const s = stageOf(b);
  if (s[0] === "egg") return '<span style="font-size:' + (small ? 30 : 48) + 'px">🥚</span>';
  const g = b.genes || genesFor(b.id);
  let pattern = "";
  if (g.pattern === "stripes")
    pattern =
      '<path d="M20 28 Q32 34 44 28 M18 35 Q32 41 46 35" fill="none" stroke="' +
      g.accent +
      '" stroke-width="4" stroke-linecap="round"/>';
  if (g.pattern === "spots")
    pattern =
      '<circle cx="23" cy="31" r="4" fill="' +
      g.accent +
      '"/><circle cx="39" cy="37" r="3.5" fill="' +
      g.accent +
      '"/><circle cx="34" cy="24" r="3" fill="' +
      g.accent +
      '"/>';
  if (g.pattern === "cheeks")
    pattern = '<circle cx="18" cy="23" r="4" fill="#f48b8b"/><circle cx="46" cy="23" r="4" fill="#f48b8b"/>';
  if (g.pattern === "bib") pattern = '<ellipse cx="32" cy="38" rx="12" ry="13" fill="' + g.belly + '"/>';
  const base =
    '<ellipse cx="32" cy="35" rx="22" ry="24" fill="' +
    g.body +
    '" stroke="#4c5960" stroke-width="2"/><ellipse cx="32" cy="42" rx="13" ry="15" fill="' +
    g.belly +
    '"/>' +
    pattern +
    '<circle cx="24" cy="20" r="3" fill="#222"/><circle cx="40" cy="20" r="3" fill="#222"/><path d="M29 25 L35 25 L32 30 Z" fill="#ef9b35"/><path d="M12 34 Q4 39 13 44" fill="' +
    g.accent +
    '" stroke="#4c5960" stroke-width="2"/><path d="M52 34 Q60 39 51 44" fill="' +
    g.accent +
    '" stroke="#4c5960" stroke-width="2"/><path d="M25 58 l-3 4 M39 58 l3 4" stroke="#9a6b38" stroke-width="2"/>';
  const open = '<svg viewBox="0 0 64 64" width="100%" height="100%" aria-hidden="true">';
  if (s[0] === "chick")
    return (
      open +
      '<path d="M29 23 q-3 -7 2 -8 q-1 4 3 3 q-1 4 -5 5Z" fill="' +
      g.body +
      '" stroke="#4c5960" stroke-width="1.5"/><circle cx="32" cy="36" r="15" fill="' +
      g.body +
      '" stroke="#4c5960" stroke-width="2"/><circle cx="32" cy="36" r="15" fill="#fff" opacity=".35"/><circle cx="26" cy="33" r="3.4" fill="#222"/><circle cx="38" cy="33" r="3.4" fill="#222"/><circle cx="27" cy="32" r="1.1" fill="#fff"/><circle cx="39" cy="32" r="1.1" fill="#fff"/><path d="M29.5 37 L34.5 37 L32 41 Z" fill="#ef9b35"/><path d="M13 45 l4.5 -5 l4.5 5 l4.5 -5 l4.5 5 l4.5 -5 l4.5 5 l4.5 -5 l4.5 5 Q51 61 32 61 Q13 61 13 45Z" fill="#fff8e8" stroke="#c9b58f" stroke-width="2"/></svg>'
    );
  if (s[0] === "young")
    return (
      open +
      '<path d="M45 47 L57 43 L55 51 Z" fill="' +
      g.accent +
      '" stroke="#4c5960" stroke-width="1.5"/><g transform="translate(32 62) scale(.82) translate(-32 -62)"><path d="M31 13 q1 -7 6 -6 q-4 2 -2 7Z" fill="' +
      g.accent +
      '" stroke="#4c5960" stroke-width="1.5"/>' +
      base +
      "</g></svg>"
    );
  return (
    open +
    '<path d="M46 44 Q60 40 63 30 Q58 44 63 52 Q56 50 46 50Z" fill="' +
    g.accent +
    '" stroke="#4c5960" stroke-width="1.5"/><path d="M27 14 q-4 -9 1 -11 q0 6 4 9 q0 -9 5 -10 q-1 6 0 10 q3 -6 8 -5 q-4 4 -6 9Z" fill="' +
    g.accent +
    '" stroke="#4c5960" stroke-width="1.5"/>' +
    base +
    "</svg>"
  );
}
function sleepyEyes(svg) {
  return svg
    .replace(/<circle cx="[\d.]+" cy="[\d.]+" r="1\.1" fill="#fff"\/>/g, "")
    .replace(
      /<circle cx="([\d.]+)" cy="([\d.]+)" r="3(?:\.4)?" fill="#222"\/>/g,
      (m, x, y) =>
        '<path d="M' + (x - 3) + " " + y + ' q3 2.5 6 0" stroke="#222" stroke-width="1.8" fill="none"/>',
    );
}
