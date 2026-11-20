#!/usr/bin/env bash
tail -n +2 "$1" | awk -F, '{ total[$2] += $3 } END { for (c in total) printf "%s %.2f\n", c, total[c] }' | sort -s -k2,2nr
