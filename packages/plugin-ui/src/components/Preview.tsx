import React from "react";
import { HTMLPreview } from "types";
import { cn, replacePlaceholderImages } from "../lib/utils";

const Preview: React.FC<{
  htmlPreview: HTMLPreview;
}> = (props) => {
  const {
    htmlPreview,
  } = props;

  const containerWidth = 320;
  const containerHeight = 180;

  const scaleFactor = Math.min(
    containerWidth / htmlPreview.size.width,
    containerHeight / htmlPreview.size.height,
  );

  const contentWidth = htmlPreview.size.width * scaleFactor + 2; 
  return (
    <div className="flex flex-col w-full bg-card rounded-lg border border-border">
      <div className="flex justify-between items-center px-3 py-2 border-b border-border">
        <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          预览
        </h3>
      </div>

      <div className="flex justify-center items-center bg-neutral-50 dark:bg-neutral-900 p-3">
        <div
          className="relative"
          style={{
            width: containerWidth,
            height: containerHeight,
            transition: "width 0.3s ease, height 0.3s ease",
          }}
        >
          <div
            className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2`}
            style={{
              width: contentWidth,
              height: htmlPreview.size.height * scaleFactor,
              transition: "width 0.3s ease, height 0.3s ease",
            }}
          >
            <div
              className={cn(
                "w-full h-full flex justify-center items-center overflow-hidden",
                "bg-white", "border border-indigo-400 dark:border-indigo-500 rounded-sm shadow-2xs",
                `transition-all duration-300 ease-in-out`,
              )}
            >
              <div className="w-full h-full flex justify-center items-center">
                <div
                  style={{
                    zoom: scaleFactor,
                    width: htmlPreview.size.width,
                    height: htmlPreview.size.height,
                    transformOrigin: "center",
                    maxWidth: "100%",
                    maxHeight: "100%",
                    aspectRatio: `${htmlPreview.size.width} / ${htmlPreview.size.height}`,
                    transition: "all 0.3s ease",
                  }}
                  dangerouslySetInnerHTML={{
                    __html: replacePlaceholderImages(htmlPreview.content),
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-3 py-1.5 text-xs text-neutral-500 dark:text-neutral-400 flex items-center justify-between border-t border-neutral-200 dark:border-neutral-700">
        <span>
          {htmlPreview.size.width.toFixed(0)}×
          {htmlPreview.size.height.toFixed(0)}px
        </span>
      </div>
    </div>
  );
};

export default Preview;
