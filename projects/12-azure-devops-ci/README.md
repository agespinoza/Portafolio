# Azure DevOps Continuous Integration

Compile and test a Python inspection duration utility after pushes. Failed compilation or tests stop the build.

## Career context

At Opus, I implemented cloud-based continuous integration with Azure DevOps. This pipeline shows how to automate compilation and tests for an inspection utility.

## Run the demo

In Azure DevOps, create a YAML pipeline and select `projects/12-azure-devops-ci/azure-pipelines.yml` in this repository. Run it manually once, then push a change to this directory. For Azure Repos pull requests, configure a build-validation branch policy. Locally, run `python3 -m compileall -q duration.py test_duration.py` and `python3 -m unittest -v`.
