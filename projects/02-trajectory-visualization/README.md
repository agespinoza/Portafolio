# Interactive Trajectory Chart

Plot the ETL project's timestamped points in Cartesian coordinates.

## Career context

This chart builds on the simulated trajectory ETL demo inspired by my mission operations work at the University of Arizona Space Institute. It shows how cleaned, timestamped data can support visual review.

## Run the demo

From the repository root, run `python3 -m http.server 8000` and visit `http://localhost:8000/projects/02-trajectory-visualization/`. Use the point selector or focus a chart marker to inspect its UTC timestamp. To refresh the source, run the ETL demo first.
