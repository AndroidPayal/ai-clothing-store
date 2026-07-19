import useCart from "@/hooks/useCart";
import Image from "next/image";

export default function OrderSummary(){
    const { cart, cartTotal } = useCart();
    
    return (
         <div>
       
                 <h2 className="mb-5 text-2xl font-semibold">
                   Order Summary
                 </h2>
       
                 <div className="space-y-4">
       
                   {cart.map((cartItem) => (
                     <div
                       key={cartItem.product.id}
                       className="flex items-center gap-4 rounded-lg border p-4"
                     >
       
                       <Image
                         src={cartItem.product.thumbnail}
                         alt={cartItem.product.title}
                         width={80}
                         height={80}
                         className="rounded-lg"
                       />
       
                       <div className="flex-1">
       
                         <h3 className="font-semibold">
                           {cartItem.product.title}
                         </h3>
       
                         <p className="text-gray-500">
                           Qty : {cartItem.quantity}
                         </p>
       
                       </div>
       
                       <p className="font-semibold">
                         ₹
                         {cartItem.product.price *
                           cartItem.quantity}
                       </p>
       
                     </div>
                   ))}
       
                 </div>
       
                 <div className="mt-6 flex justify-between border-t pt-6 text-2xl font-bold">
       
                   <span>Total</span>
       
                   <span>₹{cartTotal}</span>
       
                 </div>
       
               </div>
    )
}