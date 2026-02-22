# The Relativist

A perceptual color-matching instrument built on functional, objective design principles exploring the subjective nature of color context. 

This application functions as both a game and a precision tool, training the eye to recognize how colors deceive the viewer based on their surroundings. It treats the digital screen as a mechanical instrument—utilizing absolute grid alignment, and minimalist typography.

## Features

* **Perceptual Color Engine:** Match a target reference color across three varying contextual background strips using pure HSL slider inputs, grounded directly in Josef Albers' theories of color interaction.
* **Objective Interface:** A stripped-down, purely functional UI featuring a strict modular grid, raw monochrome ink (`#121212`), and zero decorative noise or fake depth.
* **Mechanical Feedback:** A custom Web Audio API engine delivers tactile, low-frequency auditory responses—including "film advance" transitions, mechanical thwacks, and precision ticks—grounding the digital tool in the physical reality of analog hardware.
* **Artifact Export:** Players can authenticate and broadcast their sessions by generating, natively sharing, or downloading high-resolution PNG "Identity Card" posters of their completed color geometries.

## Tech Stack

* **Frontend:** React (TypeScript)
* **Styling:** Tailwind CSS
* **Export:** `html2canvas` for native artifact generation and the Web Share API for broadcasting
* **Audio:** Native Web Audio API (`AudioContext`) with custom oscillators and filters