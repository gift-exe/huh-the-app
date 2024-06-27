#!/bin/bash

LAST_SELECTION=$(xclip -o -selection primary)
LAST_COORDS=$(xdotool getmouselocation)

while true; do
	CURRENT_SELECTION=$(xclip -o -selection primary)
	CURRENT_COORDS=$(xdotool getmouselocation)
	if [ "$CURRENT_SELECTION" != "$LAST_SELECTION" ]; then
		echo "$CURRENT_SELECTION @huh@ $CURRENT_COORDS"
		LAST_SELECTION=$CURRENT_SELECTION
		LAST_COORDS=$CURRENT_COORDS
	fi
	sleep 1
done
