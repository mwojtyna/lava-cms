#!/bin/sh

pg_dump $DB_CONNECTION --file ./mount/dump --format custom --verbose
