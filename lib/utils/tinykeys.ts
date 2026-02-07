// forked from https://github.com/jamiebuilds/tinykeys
// to fix navigator not being defined in SSR context

import { isFocusedOnElement } from "./is-focused-on-element";

/*

MIT License

Copyright (c) 2020 Jamie Kyle

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

*/

type KeyBindingPress = [string[], string];

/**
 * A map of keybinding strings to event handlers.
 */
export interface KeyBindingMap {
  [keybinding: string]: (event: KeyboardEvent) => void;
}

export interface Options {
  ignoreFocus?: boolean;
}

/**
 * These are the modifier keys that change the meaning of keybindings.
 *
 * Note: Ignoring "AltGraph" because it is covered by the others.
 */
let KEYBINDING_MODIFIER_KEYS = ["Shift", "Meta", "Alt", "Control"];

/**
 * Keybinding sequences should timeout if individual key presses are more than
 * 1s apart.
 */
let TIMEOUT = 1000;

/**
 * Parses a "Key Binding String" into its parts
 *
 * grammar    = `<sequence>`
 * <sequence> = `<press> <press> <press> ...`
 * <press>    = `<key>` or `<mods>+<key>`
 * <mods>     = `<mod>+<mod>+...`
 */
function parse(str: string): KeyBindingPress[] {
  let MOD = /Mac|iPod|iPhone|iPad/.test(navigator.platform)
    ? "Meta"
    : "Control";

  return str
    .trim()
    .split(" ")
    .map((press) => {
      let mods = press.split("+");
      let key = mods.pop() as string;
      mods = mods.map((mod) => (mod === "$mod" ? MOD : mod));
      return [mods, key];
    });
}

/**
 * This tells us if a series of events matches a key binding sequence either
 * partially or exactly.
 */
function match(event: KeyboardEvent, press: KeyBindingPress): boolean {
  // prettier-ignore
  return !(
		// Allow either the `event.key` or the `event.code`
		(
			press[1].toUpperCase() !== event.key.toUpperCase() &&
			press[1] !== event.code
		) ||

		// Ensure all the modifiers in the keybinding are pressed.
		press[0].find(mod => {
			return !event.getModifierState(mod)
		}) ||

		// KEYBINDING_MODIFIER_KEYS (Shift/Control/etc) change the meaning of a
		// keybinding. So if they are pressed but aren't part of this keybinding,
		// then we don't have a match.
		KEYBINDING_MODIFIER_KEYS.find(mod => {
			return !press[0].includes(mod) && event.getModifierState(mod)
		})
	)
}

/**
 * Subscribes to keybindings.
 *
 * Returns an unsubscribe method.
 */
export function tinykeys(
  target: Window | HTMLElement,
  keyBindingMap: KeyBindingMap,
  options: Options = { ignoreFocus: true }
) {
  let keyBindings = Object.keys(keyBindingMap).map((key) => {
    return [parse(key), keyBindingMap[key]] as const;
  });

  let possibleMatches = new Map<KeyBindingPress[], KeyBindingPress[]>();
  let timer: ReturnType<typeof setTimeout> | null = null;

  let onKeyDown = (event: KeyboardEvent) => {
    if (event.getModifierState(event.key)) {
      return;
    }

    if (options.ignoreFocus) {
      if (isFocusedOnElement()) {
        return;
      }
    }

    keyBindings.forEach((keyBinding) => {
      let sequence = keyBinding[0];
      let callback = keyBinding[1];

      if (event.key === "/") {
        callback(event);
        return;
      }

      let prev = possibleMatches.get(sequence);
      let remainingExpectedPresses = prev ? prev : sequence;
      let currentExpectedPress = remainingExpectedPresses[0];

      let matches = match(event, currentExpectedPress);

      if (!matches) {
        possibleMatches.delete(sequence);
      } else if (remainingExpectedPresses.length > 1) {
        possibleMatches.set(sequence, remainingExpectedPresses.slice(1));
      } else {
        possibleMatches.delete(sequence);
        callback(event);
      }
    });

    if (timer) clearTimeout(timer);
    timer = setTimeout(possibleMatches.clear.bind(possibleMatches), TIMEOUT);
  };

  target.addEventListener("keydown", onKeyDown as EventListener);
  return () => {
    target.removeEventListener("keydown", onKeyDown as EventListener);
  };
}
