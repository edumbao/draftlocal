# DraftLocal Learning Notes

## What I tried

I built a local-first writing reviewer with two modes: Content Review and README Review.

The app combines browser-based rule checks with a small local language model running through WebLLM.

## Why I tried it

I wanted to understand the AppBuildersPH Local AI challenge by building something that remained useful when a cloud connection disappeared.

I also wanted the project to connect directly to my work as a content writer learning more technical workflows.

## What worked

The browser-only checks worked well for measurable tasks such as:

- keyword placement
- heading detection
- word count
- paragraph length
- sentence length
- link counts
- README section detection

I also successfully loaded Qwen2.5 0.5B locally and used it for short editorial feedback.

The local model worked offline after its first download, including after closing and reopening Chrome.

## What broke or confused me

The first model download was much heavier than the normal JavaScript checks.

I also ran into a React hydration warning that turned out to be caused by the Grammarly browser extension modifying the page.

That issue disappeared after disabling Grammarly on localhost.

I also learned that local AI does not automatically mean zero internet from the first launch.

The model still needs to be downloaded once before it can run from browser storage.

## What I learned

The biggest lesson was that not every writing problem needs AI.

Normal code is better for checks that can be measured reliably.

The local model is more useful for questions that need judgment, such as whether something may confuse a beginner.

I also learned that browser-based local AI depends on more than RAM. WebGPU support, browser storage, model size, and device resources all matter.

## How this connects to technical writing and SEO

This project made me think more carefully about how AI features should be documented.

Users need to know:

- what runs locally
- what requires internet
- what data leaves the device
- what the model can and cannot do
- what happens if browser storage is cleared
- what the limits of the review are

It also reinforced the difference between measurable SEO checks and editorial judgment.

## What I will try next

I want to improve the project documentation, add screenshots, run a final manual test checklist, and decide whether to deploy the app publicly.

I may also experiment with reviewing selected text instead of always using the first 180 words.

## Sponsors

This project is sponsored by https://targetron.com and https://seovapractice.com/ in collaboration with the Entrep Communities in Davao City, Philippines, and is part of the Ed Lab's project at https://edumbao.com/lab/
