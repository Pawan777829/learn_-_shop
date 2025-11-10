'use client';

import { useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { CheckCircle2, Loader2, MapPin, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export default function PincodeChecker() {
    const [pincode, setPincode] = useState('');
    const [status, setStatus] = useState<'idle' | 'checking' | 'available' | 'unavailable'>('idle');

    const handleCheck = () => {
        if (pincode.length < 5) return;

        setStatus('checking');
        setTimeout(() => {
            // Mock logic: For demonstration, assume pincodes starting with '1' are available
            if (pincode.startsWith('1')) {
                setStatus('available');
            } else {
                setStatus('unavailable');
            }
        }, 1000);
    }

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <label htmlFor="pincode" className="font-medium text-sm">Check Delivery</label>
            </div>
            <div className="flex gap-2">
                <Input
                    id="pincode"
                    type="text"
                    placeholder="Enter ZIP/Pincode"
                    value={pincode}
                    onChange={(e) => {
                        setPincode(e.target.value);
                        setStatus('idle');
                    }}
                    maxLength={6}
                />
                <Button variant="outline" onClick={handleCheck} disabled={status === 'checking' || pincode.length < 5}>
                    {status === 'checking' ? <Loader2 className="h-4 w-4 animate-spin"/> : 'Check'}
                </Button>
            </div>
            {status === 'available' && (
                <div className="flex items-center gap-2 text-sm text-green-600">
                    <CheckCircle2 className="h-4 w-4" />
                    <p>Great! Delivery is available to this area. <span className="font-semibold">Estimated delivery: 3-5 days.</span></p>
                </div>
            )}
            {status === 'unavailable' && (
                <div className="flex items-center gap-2 text-sm text-destructive">
                    <XCircle className="h-4 w-4" />
                    <p>Sorry, delivery is not available to this pincode yet.</p>
                </div>
            )}
        </div>
    )
}
