"use client"
import { ReservationVideo, ReservationForm } from './ReservationComponents'

export default function ReservationSection() {
  return (
    <section className="py-20 px-0">
      <div className="grid lg:grid-cols-2 gap-0">
        <ReservationVideo />
        <ReservationForm />
      </div>
    </section>
  )
}
