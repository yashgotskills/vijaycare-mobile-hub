import { useState } from "react";
import { motion } from "framer-motion";
import {
  ShieldCheck, Infinity as InfinityIcon, Check, X, Store, ShoppingBag,
  Loader2, Search, FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import ShopHeader from "@/components/shop/ShopHeader";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";

const covered = [
  "Device not charging or not powering on",
  "No sound, one-side audio or mic failure in earbuds",
  "Loose or dead connector caused by internal fault",
  "Charger stops delivering power on its own",
  "Manufacturing or internal circuit defects",
];

const notCovered = [
  "Physical damage — cracks, dents, bends or drops",
  "Cut, chewed or forcefully pulled cables",
  "Water, liquid or moisture damage",
  "Burnt units caused by voltage surge or wrong adapter",
  "Opened, repaired or tampered products",
  "Normal cosmetic wear such as scratches or discolouration",
];

const statusColors: Record<string, string> = {
  Pending: "bg-yellow-500",
  "Under Review": "bg-blue-500",
  Approved: "bg-green-500",
  Rejected: "bg-red-500",
  Replaced: "bg-purple-500",
};

interface Claim {
  id: string;
  claim_number: string;
  product_name: string;
  status: string;
  created_at: string;
  admin_notes: string | null;
  resolution: string | null;
  purchase_source: string;
}

const WarrantyPage = () => {
  const savedPhone = localStorage.getItem("vijaycare_user") || "";
  const [submitting, setSubmitting] = useState(false);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupPhone, setLookupPhone] = useState(savedPhone);
  const [claims, setClaims] = useState<Claim[] | null>(null);

  const [form, setForm] = useState({
    source: "online",
    name: "",
    phone: savedPhone,
    productName: "",
    orderNumber: "",
    billNumber: "",
    storeName: "",
    purchaseDate: "",
    issue: "",
  });

  const set = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error("Please enter your name");
    if (form.phone.replace(/\D/g, "").length < 10)
      return toast.error("Please enter a valid 10-digit phone number");
    if (!form.productName.trim()) return toast.error("Please enter the product name");
    if (form.issue.trim().length < 5) return toast.error("Please describe the issue");
    if (form.source === "online" && !form.orderNumber.trim())
      return toast.error("Order number is required for online purchases");
    if (form.source === "offline" && (!form.billNumber.trim() || !form.purchaseDate))
      return toast.error("Bill number and purchase date are required for store purchases");

    setSubmitting(true);
    try {
      const { data, error } = await supabase.rpc("create_warranty_claim" as any, {
        _user_phone: form.phone.replace(/\D/g, "").slice(-10),
        _customer_name: form.name,
        _product_name: form.productName,
        _issue_description: form.issue,
        _purchase_source: form.source,
        _order_number: form.source === "online" ? form.orderNumber : null,
        _bill_number: form.source === "offline" ? form.billNumber : null,
        _store_name: form.source === "offline" ? form.storeName || null : null,
        _purchase_date: form.source === "offline" ? form.purchaseDate : null,
      });
      if (error) throw error;
      const claim = data as any;
      supabase.functions.invoke("send-push-notification", {
        body: {
          user_phone: form.phone.replace(/\D/g, "").slice(-10),
          title: "Warranty claim received",
          body: `Claim ${claim.claim_number} for ${claim.product_name} is received. We'll update you as it's reviewed.`,
          data: { type: "warranty_claim", claim_number: claim.claim_number },
        },
      }).catch(console.error);
      toast.success(`Claim submitted — reference ${claim.claim_number}`, {
        description: "Our team will review it and contact you shortly.",
        duration: 8000,
      });
      setForm({
        source: form.source,
        name: "",
        phone: form.phone,
        productName: "",
        orderNumber: "",
        billNumber: "",
        storeName: "",
        purchaseDate: "",
        issue: "",
      });
    } catch (err: any) {
      toast.error(err?.message || "Could not submit your claim");
    } finally {
      setSubmitting(false);
    }
  };

  const handleLookup = async () => {
    const phone = lookupPhone.replace(/\D/g, "").slice(-10);
    if (phone.length < 10) return toast.error("Enter the phone number used for the claim");
    setLookupLoading(true);
    try {
      const { data, error } = await supabase.rpc("get_warranty_claims_by_phone" as any, {
        _user_phone: phone,
      });
      if (error) throw error;
      setClaims((data as Claim[]) || []);
    } catch (err: any) {
      toast.error(err?.message || "Could not load your claims");
    } finally {
      setLookupLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <ShopHeader />

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <Badge className="mb-4 gap-1">
            <InfinityIcon className="w-3.5 h-3.5" />
            Lifetime Warranty
          </Badge>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            Lifetime Warranty on Chargers, Earbuds & Cables
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Every charger, earbud and data cable you buy from us is covered for life against
            internal faults — whether you bought it online or from our store counter.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-4 mb-10">
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <ShieldCheck className="w-5 h-5 text-primary" />
                What is covered
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2.5">
                {covered.map((item) => (
                  <li key={item} className="flex gap-2 text-sm text-muted-foreground">
                    <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <X className="w-5 h-5 text-destructive" />
                What is not covered
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2.5">
                {notCovered.map((item) => (
                  <li key={item} className="flex gap-2 text-sm text-muted-foreground">
                    <X className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
              <p className="text-xs text-muted-foreground mt-4">
                Physical damage of any kind is not accepted under this warranty.
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="claim" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="claim" className="gap-2">
              <FileText className="w-4 h-4" /> Raise a claim
            </TabsTrigger>
            <TabsTrigger value="status" className="gap-2">
              <Search className="w-4 h-4" /> Track my claims
            </TabsTrigger>
          </TabsList>

          <TabsContent value="claim">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle>Warranty claim form</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label>Where did you buy it?</Label>
                    <RadioGroup
                      value={form.source}
                      onValueChange={(v) => set("source", v)}
                      className="grid grid-cols-1 sm:grid-cols-2 gap-3"
                    >
                      <label
                        htmlFor="src-online"
                        className={`flex items-center gap-3 rounded-lg border p-3 cursor-pointer ${
                          form.source === "online" ? "border-primary bg-primary/5" : "border-border"
                        }`}
                      >
                        <RadioGroupItem value="online" id="src-online" />
                        <ShoppingBag className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium">Online order</span>
                      </label>
                      <label
                        htmlFor="src-offline"
                        className={`flex items-center gap-3 rounded-lg border p-3 cursor-pointer ${
                          form.source === "offline" ? "border-primary bg-primary/5" : "border-border"
                        }`}
                      >
                        <RadioGroupItem value="offline" id="src-offline" />
                        <Store className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium">Store purchase</span>
                      </label>
                    </RadioGroup>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="w-name">Your name</Label>
                      <Input
                        id="w-name"
                        value={form.name}
                        onChange={(e) => set("name", e.target.value)}
                        placeholder="Full name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="w-phone">Phone number</Label>
                      <Input
                        id="w-phone"
                        value={form.phone}
                        onChange={(e) => set("phone", e.target.value)}
                        placeholder="10-digit mobile number"
                        inputMode="numeric"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="w-product">Product</Label>
                    <Input
                      id="w-product"
                      value={form.productName}
                      onChange={(e) => set("productName", e.target.value)}
                      placeholder="e.g. 65W Fast Charger / TWS Earbuds"
                    />
                  </div>

                  {form.source === "online" ? (
                    <div className="space-y-2">
                      <Label htmlFor="w-order">Order number</Label>
                      <Input
                        id="w-order"
                        value={form.orderNumber}
                        onChange={(e) => set("orderNumber", e.target.value)}
                        placeholder="e.g. ORD202608070001"
                      />
                    </div>
                  ) : (
                    <div className="grid sm:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="w-bill">Bill number</Label>
                        <Input
                          id="w-bill"
                          value={form.billNumber}
                          onChange={(e) => set("billNumber", e.target.value)}
                          placeholder="Shop bill no."
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="w-date">Purchase date</Label>
                        <Input
                          id="w-date"
                          type="date"
                          max={new Date().toISOString().split("T")[0]}
                          value={form.purchaseDate}
                          onChange={(e) => set("purchaseDate", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="w-store">Store name (optional)</Label>
                        <Input
                          id="w-store"
                          value={form.storeName}
                          onChange={(e) => set("storeName", e.target.value)}
                          placeholder="Counter / branch"
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="w-issue">Describe the problem</Label>
                    <Textarea
                      id="w-issue"
                      rows={4}
                      value={form.issue}
                      onChange={(e) => set("issue", e.target.value)}
                      placeholder="Tell us what stopped working and when it started"
                    />
                  </div>

                  <Button type="submit" disabled={submitting} className="w-full sm:w-auto">
                    {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Submit claim
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="status">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle>Track your claims</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <Input
                    value={lookupPhone}
                    onChange={(e) => setLookupPhone(e.target.value)}
                    placeholder="Phone number used for the claim"
                    inputMode="numeric"
                  />
                  <Button onClick={handleLookup} disabled={lookupLoading}>
                    {lookupLoading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Search className="w-4 h-4 mr-2" />
                    )}
                    Find claims
                  </Button>
                </div>

                {claims && claims.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    No claims found for this number.
                  </p>
                )}

                {claims?.map((claim) => (
                  <div key={claim.id} className="rounded-lg border border-border p-4 space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-medium">{claim.claim_number}</span>
                      <Badge className={`${statusColors[claim.status] || "bg-muted"} text-white`}>
                        {claim.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {claim.product_name} ·{" "}
                      {claim.purchase_source === "offline" ? "Store purchase" : "Online order"} ·{" "}
                      {new Date(claim.created_at).toLocaleDateString()}
                    </p>
                    {claim.resolution && (
                      <p className="text-sm">
                        <span className="font-medium">Resolution: </span>
                        {claim.resolution}
                      </p>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
};

export default WarrantyPage;
