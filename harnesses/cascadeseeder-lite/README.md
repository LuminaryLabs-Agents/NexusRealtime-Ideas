# CascadeSeeder Lite FolderWalker

CascadeSeeder Lite FolderWalker is a push-triggered idea generation harness.

It reads the repo folder ontology, reads every idea under `ideas/intake/`, generates one fresh seed idea per run, expands each queued idea into scoped folder structures, and writes a full run log.

The GitHub Actions workflow can download a GGUF model from Hugging Face into the runner temp directory and pass it to llama.cpp.

The model is never committed to Git and is never published through Pages.
