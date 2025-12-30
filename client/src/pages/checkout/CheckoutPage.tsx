import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/hooks/useCart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    CreditCard,
    MapPin,
    User,
    Mail,
    Phone,
    CheckCircle,
    ArrowLeft,
    Loader2
} from "lucide-react";

export default function CheckoutPage() {
    const { items, subtotal, clear } = useCart();
    const navigate = useNavigate();
    const [step, setStep] = useState<"shipping" | "payment" | "success">(
        "shipping"
    );
    const [loading, setLoading] = useState(false);

    // Form state
    const [shippingInfo, setShippingInfo] = useState({
        fullName: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        state: "Lagos",
        zipCode: ""
    });

    const [paymentMethod, setPaymentMethod] = useState<
        "card" | "bank_transfer"
    >("card");

    const deliveryFee = 1500;
    const tax = subtotal * 0.075; // 7.5% VAT
    const total = subtotal + deliveryFee + tax;

    const validateShipping = () => {
        const required = ["fullName", "email", "phone", "address", "city"];
        return required.every(field => shippingInfo[field]?.trim());
    };

    const handleProceedToPayment = () => {
        if (!validateShipping()) {
            alert("Please fill all required fields");
            return;
        }
        setStep("payment");
    };

    const handlePayment = async () => {
        setLoading(true);

        // Simulate payment processing
        await new Promise(resolve => setTimeout(resolve, 2000));

        // In production, integrate Paystack/Flutterwave here
        // const response = await initiatePayment({ amount: total, email: shippingInfo.email });

        setLoading(false);
        setStep("success");
        clear(); // Clear cart after successful order
    };

    if (items.length === 0 && step !== "success") {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        Your cart is empty
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Add some items to proceed to checkout
                    </p>
                    <Button onClick={() => navigate("/collections")}>
                        Browse Products
                    </Button>
                </div>
            </div>
        );
    }

    if (step === "success") {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="max-w-md w-full text-center">
                    <div className="mb-6">
                        <CheckCircle className="w-20 h-20 text-green-500 mx-auto animate-bounce" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        Order Confirmed!
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Thank you for your purchase. We've sent a confirmation
                        email to{" "}
                        <span className="font-medium">
                            {shippingInfo.email}
                        </span>
                    </p>
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 mb-6">
                        <p className="text-sm text-green-800 dark:text-green-200">
                            Order ID:{" "}
                            <span className="font-mono font-bold">
                                #ORD-{Date.now()}
                            </span>
                        </p>
                    </div>
                    <div className="flex flex-col gap-3">
                        <Button
                            onClick={() => navigate("/dashboard/user/orders")}
                        >
                            View Order Details
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => navigate("/collections")}
                        >
                            Continue Shopping
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Back Button */}
                <Button
                    variant="ghost"
                    onClick={() =>
                        step === "payment" ? setStep("shipping") : navigate(-1)
                    }
                    className="mb-6"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                </Button>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2">
                        {/* Progress Steps */}
                        <div className="mb-8">
                            <div className="flex items-center justify-between mb-4">
                                <Step
                                    number={1}
                                    label="Shipping"
                                    active={step === "shipping"}
                                    completed={
                                        step === "payment" || step === "success"
                                    }
                                />
                                <div className="flex-1 h-1 bg-gray-200 dark:bg-gray-700 mx-4" />
                                <Step
                                    number={2}
                                    label="Payment"
                                    active={step === "payment"}
                                />
                            </div>
                        </div>

                        {/* Shipping Info */}
                        {step === "shipping" && (
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
                                <div className="flex items-center gap-2 mb-6">
                                    <MapPin className="w-5 h-5 text-indigo-600" />
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                        Shipping Information
                                    </h2>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <Label htmlFor="fullName">
                                            Full Name *
                                        </Label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <Input
                                                id="fullName"
                                                value={shippingInfo.fullName}
                                                onChange={e =>
                                                    setShippingInfo({
                                                        ...shippingInfo,
                                                        fullName: e.target.value
                                                    })
                                                }
                                                placeholder="John Doe"
                                                className="pl-10"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid sm:grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="email">
                                                Email *
                                            </Label>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    value={shippingInfo.email}
                                                    onChange={e =>
                                                        setShippingInfo({
                                                            ...shippingInfo,
                                                            email: e.target
                                                                .value
                                                        })
                                                    }
                                                    placeholder="you@example.com"
                                                    className="pl-10"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <Label htmlFor="phone">
                                                Phone *
                                            </Label>
                                            <div className="relative">
                                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                <Input
                                                    id="phone"
                                                    value={shippingInfo.phone}
                                                    onChange={e =>
                                                        setShippingInfo({
                                                            ...shippingInfo,
                                                            phone: e.target
                                                                .value
                                                        })
                                                    }
                                                    placeholder="+234 800 000 0000"
                                                    className="pl-10"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <Label htmlFor="address">
                                            Street Address *
                                        </Label>
                                        <Textarea
                                            id="address"
                                            value={shippingInfo.address}
                                            onChange={e =>
                                                setShippingInfo({
                                                    ...shippingInfo,
                                                    address: e.target.value
                                                })
                                            }
                                            placeholder="House number, street name"
                                            rows={3}
                                        />
                                    </div>

                                    <div className="grid sm:grid-cols-3 gap-4">
                                        <div>
                                            <Label htmlFor="city">City *</Label>
                                            <Input
                                                id="city"
                                                value={shippingInfo.city}
                                                onChange={e =>
                                                    setShippingInfo({
                                                        ...shippingInfo,
                                                        city: e.target.value
                                                    })
                                                }
                                                placeholder="Lagos"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="state">State</Label>
                                            <Input
                                                id="state"
                                                value={shippingInfo.state}
                                                onChange={e =>
                                                    setShippingInfo({
                                                        ...shippingInfo,
                                                        state: e.target.value
                                                    })
                                                }
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="zipCode">
                                                Zip Code
                                            </Label>
                                            <Input
                                                id="zipCode"
                                                value={shippingInfo.zipCode}
                                                onChange={e =>
                                                    setShippingInfo({
                                                        ...shippingInfo,
                                                        zipCode: e.target.value
                                                    })
                                                }
                                                placeholder="100001"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <Button
                                    onClick={handleProceedToPayment}
                                    className="w-full mt-6"
                                >
                                    Continue to Payment
                                </Button>
                            </div>
                        )}

                        {/* Payment */}
                        {step === "payment" && (
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                                <div className="flex items-center gap-2 mb-6">
                                    <CreditCard className="w-5 h-5 text-indigo-600" />
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                        Payment Method
                                    </h2>
                                </div>

                                <div className="space-y-4 mb-6">
                                    <button
                                        onClick={() => setPaymentMethod("card")}
                                        className={`w-full p-4 rounded-lg border-2 transition ${
                                            paymentMethod === "card"
                                                ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20"
                                                : "border-gray-200 dark:border-gray-700"
                                        }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <CreditCard className="w-6 h-6" />
                                                <div className="text-left">
                                                    <p className="font-semibold">
                                                        Card Payment
                                                    </p>
                                                    <p className="text-sm text-gray-500">
                                                        Debit/Credit Card
                                                    </p>
                                                </div>
                                            </div>
                                            {paymentMethod === "card" && (
                                                <CheckCircle className="w-5 h-5 text-indigo-600" />
                                            )}
                                        </div>
                                    </button>

                                    <button
                                        onClick={() =>
                                            setPaymentMethod("bank_transfer")
                                        }
                                        className={`w-full p-4 rounded-lg border-2 transition ${
                                            paymentMethod === "bank_transfer"
                                                ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20"
                                                : "border-gray-200 dark:border-gray-700"
                                        }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <MapPin className="w-6 h-6" />
                                                <div className="text-left">
                                                    <p className="font-semibold">
                                                        Bank Transfer
                                                    </p>
                                                    <p className="text-sm text-gray-500">
                                                        Direct bank payment
                                                    </p>
                                                </div>
                                            </div>
                                            {paymentMethod ===
                                                "bank_transfer" && (
                                                <CheckCircle className="w-5 h-5 text-indigo-600" />
                                            )}
                                        </div>
                                    </button>
                                </div>

                                <Button
                                    onClick={handlePayment}
                                    disabled={loading}
                                    className="w-full"
                                    size="lg"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Processing...
                                        </>
                                    ) : (
                                        `Pay ₦${total.toLocaleString()}`
                                    )}
                                </Button>

                                <p className="text-xs text-center text-gray-500 mt-4">
                                    Secure payment powered by Paystack
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Order Summary */}
                    <div>
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 sticky top-6">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                                Order Summary
                            </h3>

                            <div className="space-y-3 mb-4">
                                {items.map(item => (
                                    <div key={item.id} className="flex gap-3">
                                        <img
                                            src={
                                                item.imageUrl ||
                                                "/images/placeholder.svg"
                                            }
                                            alt={item.title}
                                            className="w-16 h-16 rounded object-cover"
                                        />
                                        <div className="flex-1">
                                            <p className="font-medium text-sm">
                                                {item.title}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                Qty: {item.qty}
                                            </p>
                                            <p className="text-sm font-semibold">
                                                ₦
                                                {(
                                                    item.price * item.qty
                                                ).toFixed(2)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t pt-4 space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span>Subtotal</span>
                                    <span className="font-medium">
                                        ₦{subtotal.toFixed(2)}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Delivery</span>
                                    <span className="font-medium">
                                        ₦{deliveryFee.toFixed(2)}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Tax (7.5%)</span>
                                    <span className="font-medium">
                                        ₦{tax.toFixed(2)}
                                    </span>
                                </div>
                                <div className="border-t pt-2 flex justify-between text-lg font-bold">
                                    <span>Total</span>
                                    <span className="text-indigo-600">
                                        ₦{total.toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function Step({ number, label, active, completed = false }) {
    return (
        <div className="flex items-center gap-2">
            <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    completed
                        ? "bg-green-500 text-white"
                        : active
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-200 dark:bg-gray-700 text-gray-600"
                }`}
            >
                {completed ? <CheckCircle className="w-5 h-5" /> : number}
            </div>
            <span
                className={`text-sm font-medium ${
                    active ? "text-gray-900 dark:text-white" : "text-gray-500"
                }`}
            >
                {label}
            </span>
        </div>
    );
}
