# Inspection Status API

Look up a simulated inspection through a Jakarta REST endpoint and a browser interface.

## Career context

At the University of Arizona Space Institute, I supported Jakarta EE 10 backend development and contributed to JavaScript interfaces. This inspection lookup applies the same technologies to a small public demo.

## Run the demo

Build the WAR with Java 17 and Maven using `mvn package`. Deploy `target/inspection-status.war` to a Jakarta EE 10 server that supports Jakarta REST and JSON-B. Open the `/inspection-status/` context and look up `INS-101`, `INS-102`, or an unknown ID.
