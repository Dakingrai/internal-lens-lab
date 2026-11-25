/* The data for the Research programs tab. One object per program, each holding its projects; edit by hand.
   Program fields: name, slug, url (optional: the program's own page outside the app, such as a challenge's; shown
   as its host on the metadata line), started (YYYY-MM-DD), status (active | paused | done), aim (what the program
   is trying to do, one paragraph), image and imageAlt (optional: the program's own illustration, a file in
   images/, shown whole on its page, and one plain sentence describing it), projects.
   Project fields: title, slug, started, status (idea | planning | active | writing | done), question (the research
   question, one sentence), summary (one paragraph), resources (urls of entries in resources.js the project reads;
   shown under "Reading" on its page), experiments (optional; listed under "Experiments" on its page),
   links (optional; listed under "Useful links" at the bottom of its page, each opening in a new tab: title, url,
   by (who made it), note (one sentence on what it is and why it helps)),
   details (optional; pages of their own about the project, shown as tiles on its page that open in a new tab,
   detail.html?p=<project slug>&d=<detail slug>. Each: slug, title, blurb (one sentence for the tile and the page's
   lede), and optionally dataset: about as paragraphs (a link is written [text](address); an address inside the site is relative to
   detail.html), sets as {name, count, note} for the composition table, source
   as {label, url} for where the facts come from, practice as {label, page, file} for a public JSONL of questions
   that practice.js shows one at a time, loading file live; never copy it into the repo. Or bank as {label, page, host, files}
   for a question bank published elsewhere, each file {name, file, shape} a public JSON file that bank.js loads live
   and shows through the practice viewer; shape is basic | multihop | multilingual, WorkspaceBench's layouts. A detail with no content
   reads "Not written yet.").
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
        links: [
          {
            title: "Looped Lens Challenge leaderboard",
            url: "https://ndif-looped-lens-challenge.hf.space/",
            by: "NDIF",
            note: "The official standings: each team's best entry, scored on the three hidden datasets.",
          },
          {
            title: "Looped Lens Challenge meta",
            url: "https://waka.mx/loops",
            by: "Mihai Cosma (team waka.mx)",
            note: "An unofficial, live analysis of the leaderboard: which of the 48 layer visits entries read, and how those choices go with their scores, with a check on how much of the difference is noise.",
          },
          {
            title: "looped-lens-challenge",
            url: "https://github.com/ndif-team/looped-lens-challenge",
            by: "NDIF",
            note: "The starter repository: a logit lens that runs on the practice questions, the tools to score and submit an entry, and the leaderboard's judge.",
          },
          {
            title: "Opening the box of Inkling 2 Mini using NNsight+NDIF",
            url: "https://nnsight.net/blog/2026/11/20/opening-the-box-of-inkling-2-mini-using-nnsight-ndif/",
            by: "nnsight blog",
            note: "How Inkling 2 Mini's loop is laid out and how to read its layer visits with nnsight on NDIF, as the challenge page describes it.",
          },
        ],
        experiments: [
          {
            title: "Where the logit lens finds the intermediate: all 48 layer visits on the practice questions",
            status: "done",
            date: "2026-11-24",
            tags: ["preliminary", "AI-run", "unreviewed"],
            href: "experiments/logit-lens-all-visits.html",
            summary: "Reads the starter's logit lens at every one of the 48 layer visits, at the last token of the 10 practice questions, and keeps its top 10 tokens and the intermediate's rank at each. It finds the intermediate on the six questions about a fact and on none of the four about a sequence or a sum, and only at 10 of the 48 visits. A second part runs the same lens on WorkspaceBench's 238 single-token questions, where the split repeats on the basic file (22 of 27 facts, 4 of 25 sequences and sums).",
          },
          {
            title: "Does next-token prediction use a small subspace of the final activation?",
            status: "running",
            date: "2026-11-25",
            progress: { percent: 10, updated: "2026-11-25", now: "Stopped before the first fit: the local logit lens agrees with the practice-question readouts from NDIF on the top token at 432 of 480 layer visits, short of the check, and the owner is reading that before anything is fitted." },
            tags: ["preliminary", "AI-assisted", "unreviewed"],
            href: "experiments/prediction-subspace.html",
            summary: "Learns, on our own GPU with the model frozen, the k directions of the final activation that best keep the next-token distribution when everything outside them is set to its average, for k from 16 up to the full width of 2,304, on 1,000 passages of general text. It reports the held-out KL at each k beside PCA's, and the smallest k that holds it to 0.1 nats. A small k, several times below PCA's, would justify building a Jacobian lens that targets only those directions; a k near PCA's would not.",
          },
        ],
        details: [
          {
            slug: "benchmark",
            title: "Benchmark",
            blurb: "How the 300 questions are built, what the practice and scored sets hold, and the 10 practice questions to try.",
            dataset: {
              about: [
                "Each question is a short prompt on which Inkling 2 Mini has to work out one thing it never writes down: the question's intermediate, which in phase one is a single token. A lens passes the question by surfacing that token in what it reads off the model's activations. The questions follow [WorkspaceBench](papers/workspacebench.html), which keeps a question only if the model answers it reliably without a chain of thought and the intermediate appears in neither the prompt nor the answer.",
                "The prompt is put to the model in its chat format with thinking turned off, and the lens reads at the input's last token, just before the model starts its answer, at up to 10 of its 48 layer visits with 10 tokens each. A judge model is then shown the readout and five options, the intermediate and four distractors, but not the question. Each layer votes for the highest-ranked option it names, and the question passes only if the intermediate wins outright.",
              ],
              sets: [
                { name: "Practice", count: 10, note: "Public, with their answers and options. The questions below, which the starter repository's local run scores a lens on." },
                { name: "Scored", count: 290, note: "Hidden, in three datasets (A, B and C) that the leaderboard runs. They include kinds of question the practice set does not have." },
              ],
              source: { label: "Looped Lens Challenge README", url: "https://github.com/ndif-team/looped-lens-challenge#the-questions" },
              practice: {
                label: "NDIF/looped-lens-challenge-test",
                page: "https://huggingface.co/datasets/NDIF/looped-lens-challenge-test",
                file: "https://huggingface.co/datasets/NDIF/looped-lens-challenge-test/resolve/main/practice/private/questions.jsonl",
              },
            },
          },
          {
            slug: "dataset",
            title: "Dataset",
            blurb: "WorkspaceBench as adapted to Inkling 2 Mini: 2,700 questions in 28 files, and a proposal to evaluate on its 238 single-token questions.",
            dataset: {
              about: [
                "[WorkspaceBench](papers/workspacebench.html) was built for Qwen-3.6-27B. Its repository also holds versions adapted to other models, and one of them is for Inkling 2 Mini: 2,700 questions in 28 files, one file per family, each question checked again against this model's own answers. A question carries its prompt, the intermediate the model is expected to work out, and in most families four distractors, which is what the challenge's judge needs.",
                "Proposed: use the three single-token files, 238 questions, as this project's evaluation set. Their intermediates are single tokens, as phase one's are. The basic file has the practice set's seven kinds in the same wording, and three of the ten practice prompts appear in it word for word, so it is the closest public material to what the leaderboard scores.",
                "Two cautions. The scored questions may be drawn from this same material, so we evaluate on it and do not train a lens on it until the organisers say that is allowed. And only the basic file is put to the model in its chat format and read at the last token, as the challenge does: the multihop and multilingual files are written to be fed as plain text, and the multihop file to be read at the prompt's last word.",
              ],
              sets: [
                { name: "Basic readout, single token", count: 53, note: "Athlete 12, landmark 8, musician 7, arithmetic 6, day after 5, day before 6, month after 8, implicit 1. Proposed." },
                { name: "Multihop, single token", count: 97, note: "Two-step facts whose bridge is the intermediate, such as the element with atomic number 26 on the way to its symbol. Proposed." },
                { name: "Multilingual, single token", count: 88, note: "A short prompt in another language, mostly French, Spanish, German and Portuguese; the intermediate is the answer's concept in English. Proposed." },
                { name: "The other 25 files", count: 2462, note: "Arithmetic intermediates 451, chains, associations, typos, user modelling, safety families and more. Mostly not single-token; for later phases." },
              ],
              source: { label: "WorkspaceBench repository, adapted/inkling-2-mini", url: "https://github.com/camila-blank/workspace-bench/tree/main/adapted/inkling-2-mini" },
              bank: {
                label: "camila-blank/workspace-bench",
                page: "https://github.com/camila-blank/workspace-bench/tree/main/adapted/inkling-2-mini",
                host: "GitHub, as of 23 Nov 2026",
                files: [
                  { name: "Basic readout", shape: "basic", file: "https://raw.githubusercontent.com/camila-blank/workspace-bench/401e7bda781881279f2d540447b1f2bbf19495db/adapted/inkling-2-mini/basic_readout_st.json" },
                  { name: "Multihop", shape: "multihop", file: "https://raw.githubusercontent.com/camila-blank/workspace-bench/401e7bda781881279f2d540447b1f2bbf19495db/adapted/inkling-2-mini/multihop_st.json" },
                  { name: "Multilingual", shape: "multilingual", file: "https://raw.githubusercontent.com/camila-blank/workspace-bench/401e7bda781881279f2d540447b1f2bbf19495db/adapted/inkling-2-mini/multilingual_st.json" },
                ],
              },
            },
          },
          {
            slug: "inkling-2-mini-architecture",
            title: "Inkling 2 Mini architecture",
            blurb: "The looped model a lens has to read: 24 layers, layers 6 to 17 run three times, so 48 layer visits per token.",
          },
        ],
      },
    ],
  },
];
