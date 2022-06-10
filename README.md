### Connectivity-Checker

A full-stack app to monitor performance of my personal web apps.

Includes:

- Frontend built with Svelte
- Backend server built with Go
- MongoDB database
- A Go program to measure response times and update the database scheduled as a AWS cron job

UI of frontend heavily inspired by Better Uptime's status page.

TODO: Migrate data update routine from AWS lambda functions to switch from HTTP get requests to ICMP (ping) to give a more accurate readings of response time.
