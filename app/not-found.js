"use client"
import Link from "next/link";
import Image from "next/image";
import { ArrowPathIcon, ShoppingBagIcon, ShieldCheckIcon, UserGroupIcon } from "@heroicons/react/24/outline";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#f7f6f2] flex flex-col">
      <div className="">
        <div className="max-w-7xl mx-auto w-full px-6 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center shrink-0">
                <ArrowPathIcon className="w-6 h-6 text-slate-700" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">7 Day Returns</h3>
                <p className="text-sm text-slate-600">Easy returns within 7 days</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center shrink-0">
                <ShieldCheckIcon className="w-6 h-6 text-slate-700" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Secure Shopping</h3>
                <p className="text-sm text-slate-600">100% secure checkout process</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center shrink-0">
                <UserGroupIcon className="w-6 h-6 text-slate-700" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Expert Support</h3>
                <p className="text-sm text-slate-600">24/7 customer assistance</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="text-center max-w-2xl">
          <div className="relative flex items-center justify-center mb-12">
            <span className="text-[180px] sm:text-[220px] font-extrabold text-slate-900 leading-none">
              4
            </span>

            <div className="relative mx-2">
              <span className="text-[180px] sm:text-[220px] font-extrabold text-slate-900 leading-none">
                0
              </span>

              <span className="absolute top-[35%] left-1/2 -translate-x-1/2 w-20 h-3 bg-slate-500 rounded-full"></span>
              <span className="absolute top-[35%] left-1/2 -translate-x-1/2 translate-y-2 w-4 h-4 bg-slate-500 rounded-full"></span>
              <span className="absolute top-[38%] left-1/2 -translate-x-1/2 translate-y-6 w-5 h-28 bg-slate-500 rounded-b-full rotate-6"></span>
            </div>

            <span className="text-[180px] sm:text-[220px] font-extrabold text-slate-900 leading-none">
              4
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-6">
            Oops! Page Not Found
          </h1>

          <p className="text-base sm:text-lg text-slate-600 mb-8 max-w-lg mx-auto leading-relaxed">
            The page you&apos;re looking for seems to have wandered off. Don&apos;t worry, let&apos;s get you back on track with some amazing products.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-8 py-4 bg-slate-900 text-white text-base font-semibold rounded-lg hover:bg-slate-800 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <ShoppingBagIcon className="w-5 h-5" />
              Continue Shopping
            </Link>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-8 py-4 border-2 border-slate-900 text-slate-900 text-base font-semibold rounded-lg hover:bg-slate-900 hover:text-white transition-all duration-200"
            >
              Browse Products
            </Link>
          </div>

          <div className="mt-12 pt-8 border-t border-slate-200">
            <p className="text-sm text-slate-500 mb-4">Popular Categories</p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link href="/category/clothing" className="px-4 py-2 bg-slate-100 text-slate-700 rounded-full text-sm hover:bg-slate-200 transition-colors">
                Clothing
              </Link>
              <Link href="/category/accessories" className="px-4 py-2 bg-slate-100 text-slate-700 rounded-full text-sm hover:bg-slate-200 transition-colors">
                Accessories
              </Link>
              <Link href="/category/shoes" className="px-4 py-2 bg-slate-100 text-slate-700 rounded-full text-sm hover:bg-slate-200 transition-colors">
                Shoes
              </Link>
              <Link href="/category/bags" className="px-4 py-2 bg-slate-100 text-slate-700 rounded-full text-sm hover:bg-slate-200 transition-colors">
                Bags
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
