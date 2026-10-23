// "use client";

// import { useEffect } from 'react';

// const WebPreventionCommands = () => {
//   useEffect(() => {
//     const handleContextMenu = (e) => e.preventDefault();
//     const handleCopy = (e) => e.preventDefault();

//     const handleKeyDown = (e) => {
//       const isCmdOrCtrl = e.ctrlKey || e.metaKey;
//       const key = e.key.toLowerCase();

//       // Block Ctrl/Cmd + C, S, A, P
//       if (isCmdOrCtrl && ['c', 's', 'a', 'p'].includes(key)) {
//         e.preventDefault();
//       }

//       // Block Mac screenshot shortcuts: Cmd + Shift + 3 / 4 / 5 / S
//       if (isCmdOrCtrl && e.shiftKey && ['3', '4', '5', 's'].includes(key)) {
//         e.preventDefault();
//       }

//       // Block F12 and DevTools shortcuts (Ctrl/Cmd + Shift + I / J / C)
//       if (
//         e.key === 'F12' ||
//         (isCmdOrCtrl && e.shiftKey && ['j', 'c'].includes(key))
//       ) {
//         e.preventDefault();
//       }

//       // Block PrintScreen key
//       if (e.key === 'PrintScreen') {
//         e.preventDefault();
//       }
//     };

//     const handleKeyUp = (e) => {
//       // Overwrite clipboard if PrintScreen slipped through OS handlers
//       if (e.key === 'PrintScreen') {
//         navigator.clipboard?.writeText('');
//       }
//     };

//     document.addEventListener('contextmenu', handleContextMenu);
//     document.addEventListener('copy', handleCopy);
//     document.addEventListener('keydown', handleKeyDown);
//     document.addEventListener('keyup', handleKeyUp);

//     return () => {
//       document.removeEventListener('contextmenu', handleContextMenu);
//       document.removeEventListener('copy', handleCopy);
//       document.removeEventListener('keydown', handleKeyDown);
//       document.removeEventListener('keyup', handleKeyUp);
//     };
//   }, []);

//   return null;
// };

// export default WebPreventionCommands;

"use client";

import { useEffect } from "react";

const WebPreventionCommands = () => {
  useEffect(() => {
    const handleContextMenu = (e) => e.preventDefault();

    const handleKeyDown = (e) => {
      const isCmdOrCtrl = e.ctrlKey || e.metaKey;
      const key = e.key.toLowerCase();

      // Block Ctrl/Cmd + S and P only
      if (isCmdOrCtrl && ["s", "p"].includes(key)) {
        e.preventDefault();
      }

      // Block Mac screenshot shortcuts: Cmd + Shift + 3 / 4 / 5 / S
      if (
        isCmdOrCtrl &&
        e.shiftKey &&
        ["3", "4", "5", "s"].includes(key)
      ) {
        e.preventDefault();
      }

      // Block F12 and DevTools shortcuts
      if (
        e.key === "F12" ||
        (isCmdOrCtrl && e.shiftKey && ["j", "c"].includes(key))
      ) {
        e.preventDefault();
      }

      // Block PrintScreen key
      if (e.key === "PrintScreen") {
        e.preventDefault();
      }
    };

    const handleKeyUp = (e) => {
      if (e.key === "PrintScreen") {
        navigator.clipboard?.writeText("");
      }
    };

    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  return null;
};

export default WebPreventionCommands;
