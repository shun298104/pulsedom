import React, { useState } from "react";
import { Button } from "./button";
import { Input } from "@/components/ui/input";
import { Share2, Loader2, Check } from "lucide-react";
// SimOptions型とencodeSimOptionsToURL関数はインポート or 定義してください

type Props = {
  simOptions: SimOptions;
};

export const ShareUrlButton: React.FC<Props> = ({ simOptions }) => {
  const [shortUrl, setShortUrl] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    setLoading(true);
    setCopied(false);
    try {
      // 1. SimOptionsをエンコード
      const encoded = encodeSimOptionsToURL(simOptions);
      const longUrl = `${window.location.origin}/sim?data=${encoded}`;

      // 2. is.gd APIで短縮
      const apiUrl = `https://is.gd/create.php?format=simple&url=${encodeURIComponent(longUrl)}`;
      const res = await fetch(apiUrl);
      if (!res.ok) throw new Error("URL短縮に失敗しました");
      const url = await res.text();
      setShortUrl(url);
    } catch (e) {
      alert("URL短縮に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!shortUrl) return;
    await navigator.clipboard.writeText(shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="flex flex-col gap-2 items-start">
      <Button onClick={handleShare} disabled={loading} variant="outline" className="flex gap-2 items-center">
        {loading ? <Loader2 className="animate-spin w-4 h-4" /> : <Share2 className="w-4 h-4" />}
        共有URLを作成
      </Button>
      {shortUrl && (
        <div className="flex gap-2 items-center">
          <Input value={shortUrl} readOnly className="w-72 text-sm" />
          <Button onClick={handleCopy} size="icon" variant="secondary">
            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Share2 className="w-4 h-4" />}
          </Button>
        </div>
      )}
    </div>
  );
};
