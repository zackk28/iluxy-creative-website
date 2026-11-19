"use client";

import React, { useState } from "react";
import PinGateModal from "./PinGateModal";
import GalleryMasonryView from "./GalleryMasonryView";

export default function GalleryAccessClient({
  gallery,
  mediaAssets = [],
  initialSelections = [],
  isPreUnlocked = false,
}) {
  const [isUnlocked, setIsUnlocked] = useState(isPreUnlocked);

  if (!isUnlocked) {
    return (
      <PinGateModal
        slug={gallery.access_slug}
        galleryTitle={gallery.title}
        onUnlock={() => setIsUnlocked(true)}
      />
    );
  }

  return (
    <GalleryMasonryView
      gallery={gallery}
      mediaAssets={mediaAssets}
      initialSelections={initialSelections}
    />
  );
}
