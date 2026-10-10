# DraftLocal

DraftLocal is a local-first writing reviewer for content and README files.

It combines rule-based checks with a small language model that runs in the browser using WebLLM.

I built this as a learning project to understand local AI, browser-based inference, GitHub workflows, Next.js, and how AI can support technical writing without sending every draft to a cloud service.

## What DraftLocal does

DraftLocal currently has two review modes.

### Content Review

Content Review checks:

- word count
- paragraph count
- heading count
- target keyword in the title
- target keyword in the first 100 words
- target keyword in Markdown headings
- long paragraphs
- long sentences
- internal Markdown links
- external Markdown links

These checks run with normal browser code.

DraftLocal can also run a local AI clarity review on a short excerpt and identify one thing that may confuse a beginner reader.

### README Review

README Review checks whether common documentation sections are present, including:

- project purpose
- installation
- prerequisites
- usage
- configuration
- environment variables
- troubleshooting
- license

The local AI review uses a different prompt for README files. It looks for one instruction, assumption, or technical term that may make setup difficult for a beginner.

## Why local AI

I wanted to test whether useful writing feedback could continue working when a cloud connection was unavailable.

DraftLocal uses a small Qwen2.5 0.5B model through WebLLM.

The model runs on the user's device through the browser.

No OpenAI, Anthropic, Gemini, or other cloud AI API is used for the local review.

## Offline behavior

The first model setup requires an internet connection because the model must be downloaded by the browser.

After the model has been downloaded and stored by the browser, DraftLocal can load and use the model without a live internet connection.

I tested this by:

1. downloading the model
2. closing and reopening Chrome
3. switching Chrome DevTools Network to Offline
4. loading DraftLocal
5. enabling Local AI
6. running a new clarity review

The local AI review still worked.

This means DraftLocal supports offline review after the first model download, as long as the model remains available in browser storage.

## How the app is structured

DraftLocal separates measurable checks from AI-based judgment.

### Rule-based checks

Normal TypeScript and JavaScript handle things that can be measured reliably, such as:

- word count
- keyword placement
- heading detection
- paragraph length
- sentence length
- link counts
- README section detection

### Local AI

The local model handles more subjective questions, such as:

- whether an explanation may confuse a beginner
- whether README instructions assume too much knowledge
- whether a technical term is introduced without enough context

This separation is intentional.

Not every writing problem needs a language model.

## Sponsors

Https://targetron.com and https://seovapractice.com/ sponsor this project in collaboration with the Entrep Communities in Davao City, Philippines, and are part of the Ed Lab's project at https://edumbao.com/lab/

## Current local AI model

DraftLocal currently uses:

```text
Qwen2.5 0.5B
