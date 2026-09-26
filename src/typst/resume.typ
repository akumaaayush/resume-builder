// Resume template. Reads its content from `resume.json`, which the app injects
// as a shadow file before every compile. Ported from the Sourabh Bajaj LaTeX
// resume template so the output matches the original Overleaf build.

#let doc = json("resume.json")
#let cfg = doc.config
#let header = doc.header

#let pt(x) = x * 1pt

#set document(title: header.name, author: header.name)

#set page(
  paper: "a4",
  // Explicit, so the SVG preview emits a real page rect instead of a
  // transparent one that would show the app's dark background through.
  fill: white,
  margin: (
    top: cfg.margin.top * 1in,
    right: cfg.margin.right * 1in,
    bottom: cfg.margin.bottom * 1in,
    left: cfg.margin.left * 1in,
  ),
)

#set text(
  font: (cfg.font, "New Computer Modern", "Libertinus Serif"),
  size: pt(cfg.fontSize),
  lang: "en",
  hyphenate: false,
)

// LaTeX \raggedright: no justification, no hyphenation.
#set par(justify: false, leading: cfg.leading * 1em)

#set list(
  marker: ([#cfg.marker], [--]),
  indent: 0pt,
  body-indent: 0.55em,
  spacing: 0.65em,
  tight: true,
)

// hyperref with urlstyle{same}: links look like body text.
#show link: it => it

#let small(body) = text(size: pt(cfg.itemSize), body)

// \section + \titlerule
#let section(title) = {
  v(pt(cfg.blockSpacing))
  block(below: pt(3), text(size: pt(cfg.headingSize), smallcaps(title)))
  line(length: 100%, stroke: 0.5pt)
  v(pt(2))
}

// \resumeItem: bold lead-in, then the body text.
#let labeled-body(label, body, meta: "") = {
  if label != "" {
    strong(label)
    [ ]
  }
  body
  if meta != "" {
    [, ]
    meta
  }
}

// \resumeSubheading: two rows, each split left / right.
#let subheading(org, location, role, period) = {
  grid(
    columns: (1fr, auto),
    align: (left, right),
    row-gutter: pt(1),
    strong(org), location,
    small(emph(role)), small(emph(period)),
  )
}

#let header-block(h) = {
  let profiles = h.profiles.filter(p => p.label != "")
  let profile-row = {
    for (i, p) in profiles.enumerate() {
      if i > 0 [ | ]
      if p.url != "" { link(p.url)[#p.label] } else { p.label }
    }
  }
  let right-rows = ()
  if h.email != "" {
    right-rows.push([Email : #link("mailto:" + h.email)[#h.email]])
  }
  if h.phone != "" { right-rows.push([Mobile : #h.phone]) }
  if h.location != "" { right-rows.push([#h.location]) }

  let name-block = text(size: pt(cfg.nameSize), weight: "bold")[
    #if h.nameUrl != "" { link(h.nameUrl)[#h.name] } else { h.name }
  ]

  let left-rows = (name-block, profile-row, [])
  grid(
    columns: (1fr, auto),
    align: (left, right),
    row-gutter: pt(2),
    ..range(calc.max(left-rows.len(), right-rows.len()))
      .map(i => (
        if i < left-rows.len() { left-rows.at(i) } else { [] },
        if i < right-rows.len() { right-rows.at(i) } else { [] },
      ))
      .flatten()
  )
}

#let bullet-list(items) = {
  if items.len() == 0 { return }
  list(..items.map(it => small(labeled-body(it.at("label", default: ""), it.text))))
}

#let timeline-entry(e) = {
  subheading(e.org, e.location, e.role, e.period)
  if e.bullets.len() > 0 {
    v(pt(1))
    list(..e.bullets.map(b => small(labeled-body(b.label, b.text))))
  }
  v(pt(3))
}

// Icon links sit on the project title line. `baseline` nudges the glyph down so
// it centres against the text rather than the cap height.
#let icon-link(path, url) = {
  if url != "" {
    h(0.35em)
    link(url, box(baseline: 12%, image(path, height: 0.78em)))
  }
}

// Built in code mode on purpose: the stack line starts with "-", which would be
// parsed as a list item in markup mode.
#let project-item(p) = small({
  strong(p.name)
  icon-link("/icons/github.svg", p.at("repoUrl", default: ""))
  icon-link("/icons/globe.svg", p.at("liveUrl", default: ""))
  if p.summary != "" {
    linebreak()
    p.summary
  }
  if p.stack != "" {
    linebreak()
    h(1em)
    "- " + p.stack
  }
})

// Paragraphs rather than bullets: opening profile, closing note.
#let prose-block(items) = {
  for (i, it) in items.enumerate() {
    if it.text == "" { continue }
    if i > 0 { v(pt(2)) }
    par(it.text)
  }
}

// Compact `Label   value · value` rows. Labels share one column so they line
// up, and long value runs wrap under themselves instead of under the label.
#let inline-block(items) = {
  let rows = items.filter(it => it.label != "" or it.text != "")
  if rows.len() == 0 { return }
  grid(
    columns: (auto, 1fr),
    column-gutter: 0.9em,
    row-gutter: 0.45em,
    ..rows
      .map(it => (small(strong(it.label)), small(it.text)))
      .flatten()
  )
}

#let divider-block(variant) = {
  if variant == "page" {
    pagebreak(weak: true)
  } else if variant == "rule" {
    v(pt(2))
    line(length: 100%, stroke: 0.4pt + luma(60%))
    v(pt(2))
  } else {
    v(pt(cfg.blockSpacing * 2))
  }
}

#header-block(header)

#for s in doc.sections {
  if not s.enabled { continue }

  // Dividers carry no heading; everything else opens with its section rule.
  if s.kind == "divider" {
    divider-block(s.at("variant", default: "space"))
    continue
  }

  section(s.title)

  if s.kind == "bullets" {
    bullet-list(s.items)
  } else if s.kind == "prose" {
    prose-block(s.items)
  } else if s.kind == "inline" {
    inline-block(s.items)
  } else if s.kind == "timeline" {
    for e in s.entries { timeline-entry(e) }
  } else if s.kind == "projects" {
    list(..s.items.map(project-item))
  } else if s.kind == "labeled" {
    list(
      ..s.items.map(it => small(labeled-body(
        it.label,
        it.text,
        meta: it.at("meta", default: ""),
      ))),
    )
  }
}

// Page-fit telemetry for the editor: total pages, and how far down the final
// page the content reaches. Queried by the app, invisible in the output.
#context [
  #metadata((
    pages: counter(page).final().first(),
    lastPage: here().page(),
    usedPt: here().position().y.pt(),
    pageHeightPt: page.height.pt(),
    topMarginPt: (cfg.margin.top * 1in).pt(),
    bottomMarginPt: (cfg.margin.bottom * 1in).pt(),
  ))<resume-fit>
]
