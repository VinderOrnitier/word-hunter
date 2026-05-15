import type { JSX } from "preact";

export function RulesTab(): JSX.Element {
  return (
    <div class="wh-rules">
      <span class="wh-editorial">a quiet game while you read.</span>

      <p class="wh-body wh-rules__body">
        On every page you visit, Word Hunter hides the active word inside a
        paragraph. It looks like normal text but is invisible to{" "}
        <code class="wh-rules__kbd">Ctrl + F</code>. Find it by reading. Click
        it to log the find.
      </p>

      <ul class="wh-rules__list">
        <li class="wh-rules__item">
          <span class="wh-rules__marker">30 +</span>
          <span class="wh-body-sm">
            words required to qualify a paragraph
          </span>
        </li>
        <li class="wh-rules__item">
          <span class="wh-rules__marker">1×</span>
          <span class="wh-body-sm">
            active word at a time, across all your tabs
          </span>
        </li>
        <li class="wh-rules__item">
          <span class="wh-rules__marker">—</span>
          <span class="wh-body-sm">
            no long text? no word hidden. you'll see a notification
          </span>
        </li>
      </ul>
    </div>
  );
}
