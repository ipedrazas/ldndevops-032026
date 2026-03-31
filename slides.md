---
# try also 'default' to start simple
theme: seriph #apple-basic
# random image from a curated Unsplash collection by Anthony
# like them? see https://unsplash.com/collections/94734566/slidev
background: https://cover.sli.dev
# some information about your slides (markdown enabled)
title: "Into the Agentic Mud Fight: Surviving the Shift from Scripts to Vibes"

# apply UnoCSS classes to the current slide
class: text-center
# https://sli.dev/features/drawing
drawings:
  persist: false
# slide transition: https://sli.dev/guide/animations.html#slide-transitions
transition: slide-left
# enable Comark Syntax: https://comark.dev/syntax/markdown
comark: true
# duration of the presentation
duration: 35min
---

# Into the Agentic Mud Fight
## Surviving the Shift from Scripts to Vibes


<div class="abs-br m-6 text-xl">
  <a href="https://github.com/slidevjs/slidev" target="_blank" class="slidev-icon-btn">
    <carbon:logo-bluesky /> @andcake.dev
  </a>
</div>

<!--
The last comment block of each slide will be treated as slide notes. It will be visible and editable in Presenter Mode along with the slide. [Read more in the docs](https://sli.dev/guide/syntax.html#notes)
-->

---
transition: slide-down
---

![alt](./mudfight.png)



---
transition: page-up
---

# Agenda
<br>
<br>

- 📝 **Intro** - Why are we here and why we're all doomed 😱
- ⏰ **Last 18 months** - A month in AI terms is like 5 human years, this is like a history lesson. 
- 👚 **Security** - "I told you so", but for real!
- 📸 **Observabilty** - My Grafana dashboards are like your granny's photo albums.
- 🎥 ~~**Reliability**~~ - "Go fast and break things" at scale!
- 🤖 **Otel Agent** - Let's build an agent, what could go wrong? 🙈

Also

- 🧰 **Skills**... Macros and SOP's love child.

---
transition: slide-left
layout: two-cols
level: 2
---

# Who I am
Recovering from my last YAML indentation error

Ivan Pedrazas, ivan@andcake.dev

~~Sysadmin~~, ~~DevOps Engineer~~, ~~SRE~~, ~~Platform Engineer~~, ~~Platform vibecoder~~, AI Engineer 

ex-Kubernetes ~~architect~~, ex-Docker, exhausted...

<style>
s{
    color: gray;
} 
</style>

<br>

- Agentic workflows
- AI Agents
- MCP

(Not in this order.)

<br>
    
I also make (and sell) Jeans 🤷‍♂️

::right::

![alt](./meme.png)

---
transition: slide-down
class: 'text-center'
---

# What does AI provide?

<style>
h1 {
    padding-top: 150px;
    font-size: xxx-large;
}
</style>

---
transition: slide-down
class: 'text-center'
layout: image-right
image: './goku.webp'
---

# Acceleration <br> & <br> Augmentation

<style>
h1 {
    padding-top: 150px;
    font-size: xxx-large;
}
</style>


---
transition: slide-left
class: 'text-center'
---

# What does AI NOT provide?
What do you bring to the table?

<style>
h1 {
    padding-top: 150px;
    font-size: xxx-large;
}
</style>

---
transition: slide-up
class: 'text-center'
layout: image-right
image: './chopwood.webp'
---

# Expertise

<style>
h1 {
    padding-top: 150px;
    font-size: xxx-large;
}
</style>

---
transition: slide-left
class: 'text-center'
---

# While WE can do anything with AI <br><br> What you can do is limited

<br> (by your expertise, <br> and resources, <br> and time...<br> and money 😅)

<style>
h1 {
    padding-top: 150px;
    font-size: xxx-large;
}
</style>

---
transition: slide-down
class: 'text-center'
---

![youtube](./youtube.png)

https://www.youtube.com/watch?v=Q6nem-F8AG8

<style>
img{
    display: block;
    margin: auto;
    width: 70%;
    
}
</style>


---
transition: slide-left
---

![taken](./taken.webp)

<style>
p {
    opacity: 1
}

h1 + p { opacity: 1 }

img {
    display: block;
    margin: auto;
    width: 70%;
    opacity: 1;
    
}
</style>


---
transition: slide-up
layout: two-cols
layoutClass: gap-16
---

# The beginning

Github Copilot


29th of June, 2021 (Technical Preview)

<v-click> 21st of June, 2022 (Public Available)

&nbsp; &nbsp; &nbsp; Powered by OpenAI GPT-3

</v-click>
<br>
    
<v-click> November 2023 -> GPT-4 </v-click>

<br>
<br>
<v-click>
6th of February, 2025 (Agent mode)

 17th of May, 2025 (Coding Agent 🤷‍♂️)

</v-click>

<br>
    
[Copilot announcement](https://github.blog/news-insights/product-news/introducing-github-copilot-ai-pair-programmer/)


::right::

![copilot announcement](./copilot.png)

Initial feedback was not great...

> Glorified auto-complete


<br>
    
> It's like intellisense, but stupid

We should learn to be nicer, really.

---
transition: slide-up
---
# The New Kid on the block
Cursor, from VSCode Fork to 💰💰💰

Initial Release: March 2023

<br><br>

<v-click>

**Multi-Edit**: an auto-complete that actually makes sense.
</v-click>


<v-click>

**Composer** (formerly Agentic IDE): vibecoding 101.
</v-click>

<v-click>

**Context-Aware Codebase Indexing**: Cursor pioneered local semantic indexing of entire codebases
</v-click>

<v-click>

**Inline Edits (Cmd-K)**: The ability to highlight code and directly instruct the AI to modify, refactor, etc.
</v-click>


<br><br>

[Cursor Changelog](https://cursor.com/changelog/page/42)
[HN - Cursor 1.0](https://news.ycombinator.com/item?id=44185256)



---
transition: slide-up
layout: two-cols
---

# Claude Code

Terminal is back on the menu, boys!

::right::

![claude code](./claudecode.webp)

---
transition: slide-left
---

# OpenClaw 
There will be lobsters!

![Lobsters](./lobsters.png)

<style>
img{
    display: block;
    margin: auto;
    width: 70%;
    padding-top: 10px;
    
}
</style>

---
transition: slide-left
---

# OpenClaw 
There will be lobsters!

![OpenClaw Star history](./openclaw-stars.png)

<style>
img{
    display: block;
    margin: auto;
    width: 70%;
    padding-top: 10px;
    
}
</style>

---
transition: slide-left
---

# Pi 
The Agent that powers OpenClaw

![pi.dev](./pi.png)

<style>
img{
    display: block;
    margin: auto;
    width: 50%;
    padding-top: 10px;
    
}
</style>

---
transition: slide-up
layout: two-cols
---

# NanoClaw

https://nanoclaw.dev/

Smaller footprint than OpenClaw, more secure.

<br>
    
Requirements: 

- Apple Container (macOS)
- Docker (Sandbox <-- MicroVMs)

::right::
![nanoclaw](./nanoclaw1.png)

---
level: 2
---

# How smaller?

Smaller footprint allows not only understand it faster, but manage it better.

````md magic-move {lines: true}
```ts {*|2-3}
// OpenClaw
Source files: 3,680
Lines of code: 434,453
Dependencies: 70
Config files: 53
Time to understand: 1–2 weeks
Security model: Application-level checks
Architecture: Single process, shared memory
```

```ts {2-3|6|7|*}
// NanoClaw
Source files: 15
Lines of code: ~3,900
Dependencies: 10
Config files: 0
Time to understand: 8 minutes
Security model: OS container isolation
Architecture: Single process + isolated containers
```

````

---
transition: slide-down
layout: two-cols
---

# Security, Security, Security
Why we always end up here talking about security?

- (Indirect) Prompt Injection
- Authorization Issues / Bad Permissions
- Supply Chain Attacks
- Data Leakage
- <span v-mark.circle.orange="1"> Non-Deterministic Behavior </span>


::right::

![here we go again](./herewego2.webp)

<style>
img{
    display: block;
    margin: auto;
    width: 80%;
    padding-top: 70px;
    
}
</style>

---
class: px-20
---

# Deterministic vs Non-Deterministic

The main issue with non-determinism is not hallucinations, it's people not understanding percentages 🙈


<div grid="~ cols-2 gap-2" m="t-2">

True/False

True 90% / False 87%

We know

We might know

Done

Might have done

Fuck...

You're absolutely right...


</div>


---
transition: slide-left
layout: two-cols
---

**False Positive**: (aka False alarms). When a test incorrectly flags a condition as present, for example: A binary contains virus

**False Negative**: (aka missed) When a test incorrectly indicates a condition is abstent: A virus is not detected

False negatives have way more risk

::right::

![](./missed.gif)

<style>
img{
    display: block;
    margin: auto;
    width: 70%;
    padding-top: 70px;
    
}
</style>

---
transition: slide-up
---

# Security Tools: Isolation (Local)

No surprise here, MicroVMs are the way to go. Choose your flavour!

- [Nvidia OpenShell](https://docs.nvidia.com/openshell/): is a safe, private runtime for autonomous AI agents. 
- [Docker Sandbox](https://docs.docker.com/ai/sandboxes/architecture/#sandbox-isolation): MicroVMs
- [nono](https://nono.sh/): Runtime safety infrastructure for AI agents.
- [E2B](https://e2b.dev/): MicroVMs
- [Edera](https://edera.dev/use-case/ai-agent-sandboxing): AI Agent Sandboxing
- [Microsandbox](https://microsandbox.dev/): MicroVMs

---
transition: slide-left
---

# Why these tools?
Running an Agent on your machine has a very big blast radius

## Reducing scope, minimising potential damage

<br>
    
- Network isolation
- Filesystem isolation
- Limit available tools

<br>
    
<br>
    
While these tools are great at reducing the scope, they do not solve another big issue:

<br>
    
**Access to Credentials**


---
transition: slide-up
---

# Not all AI Agents are the same

What do we talk when we talk about AI Agents?

<br>
    
<div grid="~ cols-2 gap-2" m="t-2">

<div>
    <strong>Personal AI Agents</strong>

User drives the Agent.

The Agent acts<span v-mark.circle.orange="1"> on behalf </span>of the user.

Runs in the user's machine.

<br>


OpenClaw/NanoClaw

Claude Code/Cowork

Pi

Codex


</div>

<div>
    <strong>Agentic Workflows</strong>

Use-case driven.

The agent runs with a Service Account.

Runs in a cluster.

<br>
    
Deployment Agent
    
PR Review Agent

...
    
</div>

</div>

---
layout: two-cols
---

# Agentic Workflows
What do we talk about when we talk about AI Agents

<br>
    
Currently, most of the AI Agents we build are not "Fully autonomous", they are classic workflows with certain degree of uncertainity.

This is why we talk about AI Agents being Use-Case driven.

::right::

<br>
    
<br>
    
![autonomouse agent](./autonomousagent.webp)


---
transition: slide-up
class: 'text-center'
---

## Elements of an AI Agent

![Architecture AI Agent](./agent.png)

<style>
img{
    display: block;
    margin: auto;
    width: 70%;
    padding-top: 20px;
    
}
</style>

---
transition: slide-left
class: 'text-center'
---

## Elements of an AI Agent II

![Architecture AI Agent](./agent2.png)

<style>
img{
    display: block;
    margin: auto;
    width: 70%;
    padding-top: 20px;
    
}
</style>

---
transition: slide-up
class: 'text-center'
---

# Let's talk about Adoption 
What is the biggest challenge <br> when adopting AI and <br> AI Agents in particular?


<style>
h1 {
    padding-top: 150px;
    font-size: xxx-large;
}
</style>


---
transition: slide-up
class: 'text-center'
---

# 

3 or 4 most useful tasks that save time


<style>
p {
    padding-top: 150px;
    font-size: xxx-large;
}
</style>

---
transition: slide-up
class: 'text-center'
---

# 

I don't know what to do with this


<style>
p {
    padding-top: 150px;
    font-size: xxx-large;
}
</style>

---
transition: fade
class: 'text-center'
---

# 

It's not about doing.

It's about NOT doing!


<style>
p {
    padding-top: 150px;
    font-size: xxx-large;
}
</style>

---
transition: fade
class: 'text-center'
---

# 

It's about <span v-mark.circle.orange="1"> changing </span> how you do things



<style>
p {
    padding-top: 150px;
    font-size: xxx-large;
}
</style>

---
transition: slide-up
class: 'text-center'
layout: image-right
image: './change2.webp'
---

# Change is HARD
But necessary

<style>
h1 {
    padding-top: 150px;
    font-size: xxx-large;
}
</style>

---
transition: slide-up
class: 'text-center'
layout: two-cols
---

# Give yourself enough time to <br> digest change  

<style>
h1 {
    padding-top: 90px;
}
</style>

::right::

![banquet](./food.webp)

<style>

img{
    display: block;
    margin: auto;
    width: 90%;
    padding-top: 70px;
    
}
</style>
---
transition: fade
class: 'text-center'
---

#

How do you Validate and Verify?


<style>
p {
    padding-top: 150px;
    font-size: xxx-large;
}
</style>

---
transition: slide-up
class: 'text-center'
---

# How do you know that what the AI Agent has produced is **correct** and **valid**

<div class="ilist">
    <v-click>Done the way you expect.</v-click>
    <br>
    <v-click>(follow policies)</v-click> 
    <br>
    <br>
    <v-click>Does what it's supposed to do.</v-click>
</div>

<style>
div.ilist {
    padding-top: 150px;
    font-size: xx-large;
}
</style>



---
transition: fade
class: 'text-center'
---

# a2
Validate and verify every repository change

https://github.com/ipedrazas/a2


---

# Platform Use Case: 
Telemetry

<br><br>
<v-click><strong>The GOAL</strong>: ALL our applications are instrumented and properly configured.</v-click>
<br><br>
<v-click><strong>The (Big) Issue</strong>: This is very hard for developers because they lack the required expertise.</v-click>
<br><br>
<v-click><strong>The Solution</strong>: Platform should instrument and configure all applications 😱</v-click>


---

# Telemetry Agent, the journey 1

We want to create an Agent that is going to validate that ALL projects are instrumented and properly configured.

<br>
    
**How fast can we iterate?**:

- Define your hypotheses:
  - Developers don't want to deal with platform concerns
  - Applications need to be instrumented
  - We can automate the instrumentation of all applications

- Define how do you're going to validate your hypotheses
  - Developer velocity?
  - User feedback?
  - MTTR?


---

# Telemetry Agent, the journey 2

Plan:

- Write a `SKILL` that validates if a project has been instrumented:
  - What do you check? How do you validate this is correct? Which steps you would follow? Understand what agents are good at vs what you want to control.
- Define the steps (worflow triggered by webhook):
  - Agent uses the `SKILL` to:
    - check out the repo.
    - run `telplatform validate` (our new `cli` 😅)
      - If the validation fails, the cli returns a new prompt .
        - Not needed but speeds up the loop <- you're driving the agent.
  - Define the success criteria
  - Define failures modes:
    - When the agent has to stop and report back (slack?)

---

# Telemetry Agent, the journey 3
Manage expectations, make sure you release something you're comfortable that fulfills users' expectations

- **Phase 1**: Agent creates a report.
  - This gives you an idea of the scope of the problem.
- **Phase 2**: Agent creates a Draft PR for Platform to review, finalise.
  - This is where we learn how to improve our agent.
- **Phase 3**: Agent creates PR.

---

# Telemetry Agent, the journey 4
Start small, iterate, expand

<br>
Start with a `SKILL` and a `cli` in Claude Code/pi.dev.

Ask a trusted developer to use them. Gather feedback.

Depending on your Org, this might be enough. 

Bear in mind that you're not taking ownership of the problem, you're helping other teams to ease their pain.

<br><br>


---

# Telemetry Agent, the journey 5
Don't build your Agent until you need to. Validate, validate, validate...

<br>
    
You can run pi.dev in RPC mode as a container and deploy it to k8s.

```bash
pi --mode rpc 
```

<br><br>

Remember which hypotheses you want to validate (webhook? user journey? integration?)

Focus on what's important, writing an Agent is usually not.

<br>

https://github.com/badlogic/pi-mono/blob/main/packages/coding-agent/examples/sdk/03-custom-prompt.ts

---
transition: slide-up
class: 'text-center'
---

# A fully automated Telemetry Agent <br><br> reduces developers' responsibility and <br><br>increases Platform freedom.


---
transition: slide-up
class: 'text-center'
layout: image-right
image: './grafana.png'
---

# Telemetry
Agents' point of view


Most of our systems have been optimized for human consumption. 

Think about how Agents access/consume data.

<br>

MCP might be an option

<br>
    
For internal datasources, <br>

APIs + CLIs work better

---
transition: slide-right
---

# Pulse 


```bash

# list containers
pulse ps

# list nodes
pulse nodes ls

# raw API call
curl -s https://pulse.alacasa.uk/api/v1/containers\?page_size\=200\&offset\=0 | jq


```
<br><br>

https://pulse.alacasa.uk/

https://github.com/ipedrazas/pulse

https://github.com/ipedrazas/pulse-gateway

---
transition: slide-left
---

# But Why, oh Why?
This is Major Tom to Ground Control / I'm stepping through the door

My agent calls Pulse API using Pulse cli.

CLI: 

- **Authorization & Authentication**: API creds vs SSH to every node. 
- **Limited access to the data**: No docker access. I decide which data I want the agent to consume.

<!-- I didn't want to give Docker access to my Agent. <br>
and I certainly did not want to give my SSH keys -->
---

# Summary

- AI moves very fast. FOCUS!
- Agents: 
  - Define the use-case
  - Define the process
  - Define how to verify & validate the process and each of the tasks
  - Write a SKILL.
  - Write the System Prompt.
  - If needed:
    - Write an API
    - Write a CLI
  - Validate, validate, validate


---

# Some other resources
Articles, tools, etc


https://skills.sh/

https://agentik.md/

https://stripe.dev/blog/minions-stripes-one-shot-end-to-end-coding-agents

https://stripe.dev/blog/minions-stripes-one-shot-end-to-end-coding-agents-part-2

https://leaddev.com/ai/squarespace-is-redrawing-the-boundaries-of-platform-engineering

https://jules.google

https://shuru.run/

https://github.com/ipedrazas/pulse

https://github.com/ipedrazas/a2

https://sli.dev/

---
transition: slide-up
class: 'text-center'
---

Questions?

![QR Code to the repo](./qrcode.png)

<style>
p {
    font-size: xxx-large;
}
img{
    display: block;
    margin: auto;
    width: 40%;
    padding-top: 70px;
    
}
</style>
