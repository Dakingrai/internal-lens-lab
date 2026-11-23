/* The data for the Research programs tab. One object per program, each holding its projects; edit by hand.
   Program fields: name, slug, url (optional: the program's own page outside the app, such as a challenge's; shown
   as its host on the metadata line), started (YYYY-MM-DD), status (active | paused | done), aim (what the program
   is trying to do, one paragraph), image and imageAlt (optional: the program's own illustration, a file in
   images/, shown whole on its page, and one plain sentence describing it), projects.
   Project fields: title, slug, started, status (idea | planning | active | writing | done), question (the research
   question, one sentence), summary (one paragraph), resources (urls of entries in resources.js the project reads;
   shown under "Reading" on its page), experiments (optional; listed under "Experiments" on its page).
   Experiment fields: title, status (planned | running | done | abandoned), date (when planned, else when run;
   YYYY-MM-DD, YYYY-MM or YYYY), tags (plain words, one from each set: stage preliminary | main | replication; who
   ran it AI-run | AI-assisted | hand-run; checking unreviewed | reviewed), code (optional link to the code),
   href (its page, experiments/<slug>.html, copied from experiments/template.html; the title links to it),
   summary (what it tests and how, in plain words), progress (optional, while it runs: percent, updated as a date,
   now as one sentence on what is happening). Home lists every experiment that is running, and every one that is
   done and still tagged unreviewed; it leaves Home when the tag becomes reviewed.
   Programs appear in file order, projects in file order within their program. Slugs name the pages
   (program.html?p=<slug>, project.html?p=<slug>), so project slugs must be unique across all programs.
   Seeded 2026-11-23 with one program and one project from the challenge page (ndif.us/looped-lens-challenge);
   the aim, question and summary are first drafts to rewrite. */
window.PROGRAMS = [
  {
    name: "The Looped Lens Challenge",
    slug: "looped-lens-challenge",
    url: "https://ndif.us/looped-lens-challenge/",
    started: "2026-11-23",
    status: "active",
    image: "images/looped-lens-challenge.svg",
    imageAlt: "The Looped Lens Challenge mark: a purple shape of four rounded lobes joined in a cross, with a blue disc at its centre.",
    aim: "An open challenge run by NDIF with Thinking Machines, Goodfire and Northeastern University: build the lens that best reads Inkling 2 Mini, saying in tokens what the model computes at a layer but does not write out. The model has no single residual stream, since each layer reads its own mix of earlier layers, and its core layers 6 to 17 run three times, so it tests whether lenses built for ordinary transformers still work. Experiments are written with nnsight and run on NDIF, in phases of growing difficulty.",
    projects: [
      {
        title: "Phase one: single-token readouts",
        slug: "phase-one-readouts",
        started: "2026-11-23",
        status: "planning",
        question: "Which lens, read at which of Inkling 2 Mini's 48 layer applications, puts the token the model is computing but not writing into its top readouts at the final position?",
        summary: "Phase one opened on 23 Nov 2026; its closing date is not yet announced. An entry is a Python script with lens files that, for one prompt from the organisers' set, chooses N read locations, reads one token position (the final one is suggested) and returns the top K tokens at each, labelled by layer; a judge scores the pooled list. The tasks are simple ones in the style of workspace-bench. Goodfire found the logit lens works on this model only at the end of each loop while the tuned and coda lenses work throughout, and left the Jacobian lens untested, which makes it the obvious first comparison. Entry needs an NDIF key and the registration form.",
        resources: [
          "https://www.goodfire.com/research/interpreting-inkling-2-mini/",
          "https://transformer-circuits.pub/2026/workspace/index.html",
          "https://arxiv.org/abs/2303.08112",
          "https://www.lesswrong.com/posts/AcKRB8wDpdaN6v6ru/interpreting-gpt-the-logit-lens",
        ],
      },
    ],
  },
];
