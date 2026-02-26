import { useState } from "react";
import { AppLayout } from "@/components/app-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Copy, Check, QrCode } from "lucide-react";
import { SiBitcoin } from "react-icons/si";
import { useToast } from "@/hooks/use-toast";
import btcQrImg from "@assets/image_1771764745210.png";
import trxQrImg from "@assets/image_1771764775315.png";

type PaymentMethod = "btc" | "trx" | "upi" | null;

export default function DonatePage() {
  const { toast } = useToast();
  const [activeMethod, setActiveMethod] = useState<PaymentMethod>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const btcAddress = "bc1qy3nr02j63nsjz3nwfjkcqyfm4q5af39w5we63d";
  const trxAddress = "TQNaS8L2rzEToPTkz41SEtrsd4jdvvDass";
  const upiId = "infiniteprooo-1@okaxis";

  const handleCopy = async (text: string, key: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      toast({ title: `${label} copied!` });
      setTimeout(() => setCopiedKey(null), 2000);
    } catch {
      toast({ title: "Failed to copy", variant: "destructive" });
    }
  };

  return (
    <AppLayout title="Support Us">
      <div className="px-4 py-6 space-y-6">
        <div className="text-center space-y-2">
          <div className="mx-auto h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
            <Heart className="h-7 w-7 text-primary" />
          </div>
          <h2 className="text-xl font-bold" data-testid="text-donate-title">Support Freefinity India</h2>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            Help us build India's own social media platform. Every contribution keeps Freefinity India running and growing.
          </p>
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Crypto</h3>

          <Card
            className={`cursor-pointer transition-all ${activeMethod === "btc" ? "ring-2 ring-primary" : ""}`}
            onClick={() => setActiveMethod(activeMethod === "btc" ? null : "btc")}
            data-testid="card-donate-btc"
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-orange-500/10 flex items-center justify-center">
                  <SiBitcoin className="h-4 w-4 text-orange-500" />
                </div>
                Bitcoin (BTC)
              </CardTitle>
              <CardDescription>Tap to show QR code</CardDescription>
            </CardHeader>
            {activeMethod === "btc" && (
              <CardContent className="space-y-4">
                <div className="flex justify-center">
                  <div className="bg-white rounded-xl p-3 inline-block">
                    <img src={btcQrImg} alt="BTC QR Code" className="w-48 h-48 object-contain" data-testid="img-btc-qr" />
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground text-center">BTC Address</p>
                  <div className="flex items-center gap-2 bg-muted rounded-lg p-2.5">
                    <code className="text-xs flex-1 break-all text-foreground" data-testid="text-btc-address">{btcAddress}</code>
                    <Button
                      size="sm"
                      variant="outline"
                      className="shrink-0 gap-1.5"
                      onClick={(e) => { e.stopPropagation(); handleCopy(btcAddress, "btc", "BTC address"); }}
                      data-testid="button-copy-btc"
                    >
                      {copiedKey === "btc" ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                      {copiedKey === "btc" ? "Copied" : "Copy"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>

          <Card
            className={`cursor-pointer transition-all ${activeMethod === "trx" ? "ring-2 ring-primary" : ""}`}
            onClick={() => setActiveMethod(activeMethod === "trx" ? null : "trx")}
            data-testid="card-donate-trx"
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-red-500/10 flex items-center justify-center">
                  <QrCode className="h-4 w-4 text-red-500" />
                </div>
                TRON (TRX)
              </CardTitle>
              <CardDescription>Tap to show QR code</CardDescription>
            </CardHeader>
            {activeMethod === "trx" && (
              <CardContent className="space-y-4">
                <div className="flex justify-center">
                  <div className="bg-white rounded-xl p-3 inline-block">
                    <img src={trxQrImg} alt="TRX QR Code" className="w-48 h-48 object-contain" data-testid="img-trx-qr" />
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground text-center">TRX Address</p>
                  <div className="flex items-center gap-2 bg-muted rounded-lg p-2.5">
                    <code className="text-xs flex-1 break-all text-foreground" data-testid="text-trx-address">{trxAddress}</code>
                    <Button
                      size="sm"
                      variant="outline"
                      className="shrink-0 gap-1.5"
                      onClick={(e) => { e.stopPropagation(); handleCopy(trxAddress, "trx", "TRX address"); }}
                      data-testid="button-copy-trx"
                    >
                      {copiedKey === "trx" ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                      {copiedKey === "trx" ? "Copied" : "Copy"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">UPI</h3>

          <Card
            className={`cursor-pointer transition-all ${activeMethod === "upi" ? "ring-2 ring-primary" : ""}`}
            onClick={() => setActiveMethod(activeMethod === "upi" ? null : "upi")}
            data-testid="card-donate-upi"
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-green-500/10 flex items-center justify-center">
                  <span className="text-sm font-bold text-green-600">U</span>
                </div>
                UPI Payment
              </CardTitle>
              <CardDescription>Tap to show UPI ID</CardDescription>
            </CardHeader>
            {activeMethod === "upi" && (
              <CardContent className="space-y-4">
                <div className="text-center space-y-2 py-4">
                  <p className="text-sm text-muted-foreground">Pay using any UPI app</p>
                  <p className="text-lg font-mono font-semibold text-foreground" data-testid="text-upi-id">{upiId}</p>
                </div>
                <Button
                  variant="outline"
                  className="w-full gap-2"
                  onClick={(e) => { e.stopPropagation(); handleCopy(upiId, "upi", "UPI ID"); }}
                  data-testid="button-copy-upi"
                >
                  {copiedKey === "upi" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copiedKey === "upi" ? "Copied!" : "Tap to Copy UPI ID"}
                </Button>
                <p className="text-[10px] text-muted-foreground text-center">
                  Use Google Pay, PhonePe, Paytm or any UPI app to send payment
                </p>
              </CardContent>
            )}
          </Card>
        </div>

        <div className="text-center pt-4 pb-6">
          <p className="text-xs text-muted-foreground">
            Thank you for supporting Freefinity India! Your contribution helps us build a better platform for India.
          </p>
        </div>
      </div>
    </AppLayout>
  );
}
