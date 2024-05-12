import React from "react";
import { LinkPreviewMetadata } from "./use-link-preview-metadata";

export const urlRegex =
  /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)$/;



  export const correctURL = (inputURL: string) => {
    // Basic regex to check if the URL is missing 'https://' or 'http://'
    const hasProtocol = /^(http:\/\/|https:\/\/).*/i.test(inputURL);

    // If URL starts directly with 'www.' or lacks '://', assume it's missing the protocol
    if (!hasProtocol) {
        // Regex to detect if it starts with 'http//' or similar mistakes
        if (/^http:\/\//i.test(inputURL)) {
            // Correct 'http//' -> 'http://'
            inputURL = inputURL.replace(/^http:\/\//i, "http://");
        } else if (/^https:\/\//i.test(inputURL)) {
            // Correct 'https//' -> 'https://'
            inputURL = inputURL.replace(/^https:\/\//i, "https://");
        } else {
            // Assume 'http://' should be added if no valid protocol is found
            inputURL = "https://" + inputURL;
        }
    }

    // Check if the URL now seems correct
    const isValid = /^(http:\/\/|https:\/\/)[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/i.test(inputURL);

    // Return the corrected URL and validity status
    return {
        correctedURL: inputURL,
        isValid: isValid,
        message: isValid ? "URL is valid." : "URL is still invalid. Please check the format."
    };
}



export const getCardSize = (data: LinkPreviewMetadata) => {
  // If link has cover image
  let width =
    data.images && data.images.length > 0 && data.description ? 720 : 400;

  // If link showing placeholder
  let height = 140;

  if (
    data.contentType.startsWith("text/html") ||
    data.contentType.startsWith("audio")
  ) {
    height = 140;
  } else if (
    data.contentType.startsWith("image") ||
    data.contentType.startsWith("video")
  ) {
    height = 300;
  } else {
    height = 100;
  }

  if (!data.description && data.images?.length !== 0) {
    height -= 60;
  }

  return [width, height];
};

export function debounce<T = void>(fn: (t: T) => void, delay: number) {
  let timeout: number | undefined;
  return (t: T) => {
    clearTimeout(timeout);
    timeout = window.setTimeout(() => {
      fn(t);
    }, delay);
  };
}

// Makes sure the user will not lose focus (editing state) when previewing a link
export const usePreventFocus = () => {
  React.useEffect(() => {
    let timer = 0;
    const listener = () => {
      setTimeout(() => {
        if (window.document.hasFocus()) {
          (top as any).focus();
          logseq.Editor.restoreEditingCursor();
        }
      });
    };
    timer = window.setInterval(listener, 1000);
    window.addEventListener("focus", listener);
    return () => {
      window.removeEventListener("focus", listener);
      clearInterval(timer);
    };
  }, []);
};
