interface ShareOptions {
  url?: string;
  title?: string;
  description?: string;
  hashtags?: string[];
}

export const shareOnFacebook = (options: ShareOptions = {}) => {
  // Use the dynamic signup URL if available, otherwise use the provided URL
  const shareUrl = options.url || (window as any).solstudySignupUrl || window.location.href;
  const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
  console.log("Sharing URL:", url);
  window.open(url, "_blank", "width=626,height=436,scrollbars=yes");
};

export const shareOnTwitter = (options: ShareOptions = {}) => {
  const shareUrl = options.url || (window as any).solstudySignupUrl || window.location.href;
  const params = new URLSearchParams({
    text: `${options.title || 'Join SolStudy - Learn Crypto, Earn Rewards!'}\n\n${options.description || 'Use my referral link to get started and we\'ll both earn points!'}`,
    url: shareUrl,
    hashtags: options.hashtags?.join(",") || "crypto,blockchain,learning",
  });

  const url = `https://twitter.com/intent/tweet?${params.toString()}`;
  window.open(url, "_blank", "width=600,height=400,scrollbars=yes");
}; 