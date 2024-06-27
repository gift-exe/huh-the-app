#!/bin/bash

LAST_SELECTION=$(xclip -o -selection primary)

while true; do
	CURRENT_SELECTION=$(xclip -o -selection primary)
	if [ "$CURRENT_SELECTION" != "$LAST_SELECTION" ]; then
		echo "$CURRENT_SELECTION @huh@"
		LAST_SELECTION=$CURRENT_SELECTION
	fi
	sleep 1
done
