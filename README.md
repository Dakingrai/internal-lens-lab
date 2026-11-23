# internal-lens-lab

A small, static workspace for research on **inspecting and verbalizing what a model's internal features encode**: logit and tuned lenses, Patchscopes, the Jacobian lens and related methods.

It comes set up for the **[Looped Lens Challenge](https://ndif.us/looped-lens-challenge/)**, an open challenge run by NDIF with Thinking Machines, Goodfire and Northeastern University: build the lens that best reads Inkling 2 Mini, a model whose middle layers run three times and which has no single residual stream. The repo gathers the background reading and a starting project for phase one, so every participant begins from the same material.

**Fork it, and make it your own lab notebook for the challenge.**

## What's inside

- **Resources**: the papers behind the challenge, grouped by method, each with a short summary and its own notes page for your reading notes. Filter by what you've read.
- **Research programs**: the Looped Lens Challenge as a program, with a project for phase one (single-token readouts). Add your own projects, questions and reading lists under it.

No build step, no server code, no dependencies. Everything is plain HTML, CSS and JavaScript, and all the content lives in two files you edit by hand: `resources.js` and `programs.js`.

## Run it locally

```bash
python3 -m http.server 8770
```

Then open http://localhost:8770.

## Use it for your own challenge entry

1. **Fork** this repository on GitHub, then clone your fork.
2. **Publish it** (optional): in your fork's *Settings → Pages*, choose *Deploy from a branch*, `main`, `/ (root)`. Your lab is then live at `https://<your-username>.github.io/internal-lens-lab/`, and you can share that link with teammates.
3. **Make the project yours**: in `programs.js`, rewrite the phase-one project's `question` and `summary` in your own words, set its `status`, and list the papers it builds on in `resources`. Add more projects as you go: one per lens idea or phase.
4. **Keep reading notes**: open `papers/<slug>.html` and write inside the `#notes` block. Set a paper's `status` in `resources.js` to `reading` or `completed` to use the filter.
5. **Add papers**: add an entry to `resources.js` and copy any `papers/<slug>.html` to the new slug (the fields are documented at the top of `resources.js` and in `CLAUDE.md`).
6. **Stay in sync**: when new resources are added upstream, pull them into your fork with GitHub's *Sync fork* button.

If you use a coding agent such as Claude Code, `CLAUDE.md` tells it how the repo is laid out, how to add papers and projects, and points it to the design rules.

## Design

The look is deliberately quiet: one column, serif titles, rows separated by hairlines, colour only where it means something, and dark mode from the system setting or the header's Light/Dark switch. The rules are in [`docs/design-rules.md`](docs/design-rules.md), and all colours and sizes are variables in `tokens.css`. If you add something new, reuse those patterns rather than adding cards, badges or coloured tags.

## Contributing

Know a paper, post or tool that would help participants? Open a pull request adding it to `resources.js` with a one-to-three-sentence summary in your own words, plus its `papers/<slug>.html` page.

## License

The code is released under the [MIT License](LICENSE). The Looped Lens Challenge mark (`images/looped-lens-challenge.svg`) is the challenge organisers' artwork, and the papers listed belong to their authors; the summaries are our own.
