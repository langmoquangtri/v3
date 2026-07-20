import React, { useCallback, useEffect, useState } from "react";
import { FieldProps, useDataSource } from "@firecms/core";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  CloseIcon,
  CircularProgress,
  Typography,
} from "@firecms/ui";

type MediaEntityValues = {
  fileName?: string;
  url?: string;
};

export function MediaPickerField({
  value,
  setValue,
  disabled,
}: FieldProps<string[]>) {
  const dataSource = useDataSource();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mediaItems, setMediaItems] = useState<
    { id: string; url: string; fileName: string }[]
  >([]);

  const selectedUrls = value ?? [];

  const loadMedia = useCallback(async () => {
    setLoading(true);
    try {
      const entities = await dataSource.fetchCollection<MediaEntityValues>({
        path: "media",
      });
      setMediaItems(
        entities
          .filter((entity) => Boolean(entity.values.url))
          .map((entity) => ({
            id: entity.id,
            url: entity.values.url as string,
            fileName: entity.values.fileName ?? entity.id,
          }))
      );
    } catch (error) {
      console.error("Không tải được thư viện ảnh:", error);
    } finally {
      setLoading(false);
    }
  }, [dataSource]);

  useEffect(() => {
    if (open) {
      loadMedia();
    }
  }, [open, loadMedia]);

  const toggleUrl = (url: string) => {
    if (selectedUrls.includes(url)) {
      setValue(selectedUrls.filter((item) => item !== url));
    } else {
      setValue([...selectedUrls, url]);
    }
  };

  const removeUrl = (url: string) => {
    setValue(selectedUrls.filter((item) => item !== url));
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        {selectedUrls.map((url) => (
          <div
            key={url}
            className="relative w-20 h-20 rounded-md overflow-hidden border border-gray-200"
          >
            <img
              src={url}
              alt=""
              className="w-full h-full object-cover"
            />
            {!disabled && (
              <IconButton
                size="small"
                className="absolute top-0.5 right-0.5 bg-white/80"
                onClick={() => removeUrl(url)}
              >
                <CloseIcon size="small" />
              </IconButton>
            )}
          </div>
        ))}
      </div>

      <Button
        variant="outlined"
        size="small"
        disabled={disabled}
        onClick={() => setOpen(true)}
      >
        Chọn ảnh từ thư viện
      </Button>

      <Dialog open={open} onOpenChange={setOpen} maxWidth="4xl" scrollable>
        <DialogTitle>Thư viện ảnh</DialogTitle>
        <DialogContent>
          {loading ? (
            <div className="flex justify-center p-8">
              <CircularProgress />
            </div>
          ) : mediaItems.length === 0 ? (
            <Typography variant="body2" color="secondary">
              Chưa có ảnh nào trong thư viện. Hãy tải ảnh lên từ một trường
              ảnh khác trước.
            </Typography>
          ) : (
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
              {mediaItems.map((item) => {
                const isSelected = selectedUrls.includes(item.url);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => toggleUrl(item.url)}
                    className={`relative aspect-square rounded-md overflow-hidden border-2 ${
                      isSelected
                        ? "border-primary"
                        : "border-transparent"
                    }`}
                  >
                    <img
                      src={item.url}
                      alt={item.fileName}
                      className="w-full h-full object-cover"
                    />
                  </button>
                );
              })}
            </div>
          )}
        </DialogContent>
        <DialogActions>
          <Button variant="filled" onClick={() => setOpen(false)}>
            Xong
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
