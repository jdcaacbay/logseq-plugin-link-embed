import "@logseq/libs";
import React from "react";
import ReactDOMServer from "react-dom/server";
import { localStorageProvider } from "./cache";
import { LinkCard } from "./LinkCard";
import { waitForPrompt } from "./store";
import rawStyle from "./style.css";
import minStyle from "./min-style.tcss?raw";
import customStyle from "./custom.css"

import {
  fetchLinkPreviewMetadata,
  getOpenGraphMetadata,
  toLinkPreviewMetadata,
} from "./use-link-preview-metadata";
import { correctURL, urlRegex } from "./utils";

const macroPrefix = ":linkpreview";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const registerMacro = () => {
  // FIXME: seems not working because Logseq will capture mousedown events on blocks
  logseq.provideModel({
    openExternalLink(e: any) {
      e.stopPropagation();
      const { url } = e.dataset;
      logseq.App.openExternalLink(url);
    },
  });
  logseq.provideStyle(rawStyle);
  logseq.provideStyle(customStyle);

  logseq.App.onMacroRendererSlotted(async ({ payload, slot }) => {
    const [type, url] = payload.arguments;
    if (!type?.startsWith(macroPrefix)) {
      return;
    }

    const cache = localStorageProvider();
    let cached = cache.get(`inlinereq$` + url);
    const render = () => {
      const inner = ReactDOMServer.renderToStaticMarkup(
        <LinkCard data={toLinkPreviewMetadata(url, null, cached)} />
      );
      logseq.provideUI({
        key: "linkpreview__" + slot,
        slot,
        reset: true,
        template: `<span data-on-click="openExternalLink" data-url="${url}">${inner}</span>`,
      });
    };
    render();
    if (!cached) {
      cached = await fetchLinkPreviewMetadata(url);
      cache.set(`inlinereq$` + url, cached);
      render();
    }
  });

  // logseq.Editor.registerSlashCommand(
  //   "Link to Block",
  //   async () => {
  //     const id = await logseq.Editor.getCurrentBlock();
  //     const url = await waitForPrompt("Provide a URL");
  //     if (!urlRegex.test(url)) {
  //       logseq.App.showMsg("This does not seem to be a valid URL", "warning");
  //     } else if (id) {
  //       const loadingMarker = `Fetching meta data of ${url}...`;
  //       await logseq.Editor.insertAtEditingCursor(loadingMarker);
  //       const d = delay(1000);
  //       try {
  //         const meta: any = await getOpenGraphMetadata(url);
  //         // Define each line as a separate block
  //         console.log(meta)
  //         const blocks = [
  //           `${meta?.title || 'Title is not available'} #web_card`,
  //           `**Image URL:** ![](${meta?.images?.[0] || 'Image is not available'})`,
  //           `**Description:** ${meta?.description || 'Description is not available'}`,
  //           `**Favicon img URL:** ![](${meta?.favicons?.[0] || 'Favicon is not available'})`,
  //           `**URL:** [${url}](${url})`
  //         ];
  
  //         // Remove the loading marker
  //         await d;
  //         const blockContent = await logseq.Editor.getBlock(id.uuid);
  //         if (blockContent && blockContent.content.includes(loadingMarker)) {
  //           await logseq.Editor.updateBlock(id.uuid, blockContent.content.replace(loadingMarker, blocks[0]));
  //           // Insert each additional block as a child
  //           for (let i = 1; i < blocks.length; i++) {
  //             await logseq.Editor.insertBlock(id.uuid, blocks[i], { sibling: false });
  //           }
  //         }
  //         else{
  //           console.log('lol')
  //         }
  //       } catch (err) {
  //         console.error("Failed to get metadata for URL", err);
  //         await logseq.Editor.updateBlock(id.uuid, "Failed to get metadata for URL");
  //       }
  //     }
  //   }
  // );
  
  logseq.Editor.registerSlashCommand(
    "url",
    async () => {
      const id = await logseq.Editor.getCurrentBlock();
      const url = await waitForPrompt("Provide a URL");
      const processedUrl = correctURL(url)
      if (!processedUrl?.isValid) {
        logseq.App.showMsg(processedUrl?.message, "warning");
      } else if (id) {
        const correctedUrl = processedUrl?.correctedURL
        if (id && processedUrl?.correctedURL) {
          const marker = `Fetching metadata for ${correctedUrl}..`;
          await logseq.Editor.insertAtEditingCursor(marker);
          await logseq.Editor.exitEditingMode();
          let res = "";
          const d = delay(100); // wait at least 1s
          try {
            const meta: any = await getOpenGraphMetadata(correctedUrl);
            console.log(meta)
            res = ReactDOMServer.renderToStaticMarkup(
              <div className="my-plugin-container">
              <div className="my-plugin-header">
                  <img className="my-plugin-dynamic-image" src={meta?.images?.[0] || 'Image not available'} alt="Dynamic Image" />
                  <div>
                      <h1 className="my-plugin-title">{meta?.title || 'Title not available'}</h1>
                      <p className="my-plugin-description">{meta?.description || 'Description not available'}</p>
                      <a className="my-plugin-link" href={correctedUrl}>{correctedUrl}</a>
                  </div>
              </div>
              <img className="my-plugin-favicon" src={meta?.favicons?.[0] || 'Favicon not available'} alt="Favicon" />
          </div>

          
          
          
          
            );
          } catch (err) {
            console.log(err)
            res = "Failed to get metadata for " + correctedUrl;
          }
          await d;
          // It seems Logseq does not have the latest content in the API too soon
          const blockContent = await logseq.Editor.getBlock(id.uuid, {
            includeChildren: true,
          });
          if (blockContent?.content.includes(marker)) {
            logseq.Editor.updateBlock(
              id.uuid,
              blockContent?.content.replace(marker, res)
            );
          }
          console.log(blockContent);
        }
      }
    }
  );


  
  
};
