/** Chrome-free capture mode. `?plate=1` marks the document so style.css hides the page chrome;
 * the viewer contract, the loading state and the error state are untouched, so a capture can
 * still drive `window.__viewer` and still see a failure. */

/** True only for an explicit `plate=1`; any other value (or none) leaves the page as authored. */
export function plateMode(search){
 return new URLSearchParams(typeof search==='string'?search:'').get('plate')==='1';
}

/** Sets `data-plate="1"` on `<html>` when plate mode is on. Returns the mode, never throws on a
 * document stub without a documentElement (the node test passes one). */
export function applyPlate(doc,search){
 const plate=plateMode(search);
 if(plate&&doc?.documentElement?.dataset)doc.documentElement.dataset.plate='1';
 return plate;
}
