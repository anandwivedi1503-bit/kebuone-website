"use client";

import { useEffect, useState } from "react";

import PageContainer from "../DashboardUI/PageContainer";
import DashboardHeader from "../DashboardUI/DashboardHeader";
import KPIGrid from "../DashboardUI/KPIGrid";
import KPICard from "../DashboardUI/KPICard";
import DashboardCard from "../DashboardUI/DashboardCard";
import SectionHeader from "../DashboardUI/SectionHeader";
import StatusBadge from "../DashboardUI/StatusBadge";
import ActionButton from "../DashboardUI/ActionButton";

export default function FleetDashboard() {

const [vehicles, setVehicles] = useState<any[]>([]);
const [editingVehicle, setEditingVehicle] = useState<any>(null);

const [searchTerm, setSearchTerm] = useState("");

const [statusFilter, setStatusFilter] =
useState("All");

useEffect(() => {

fetch("/api/vehicles")
.then((res) => res.json())
.then((data) => {

setVehicles(data.data || []);

});

}, []);

const totalVehicles = vehicles.length;

const availableVehicles = vehicles.filter(
(vehicle) =>
vehicle.vehicleStatus === "Available"
).length;

const inRideVehicles = vehicles.filter(
(vehicle) =>
vehicle.vehicleStatus === "In Ride"
).length;

const maintenanceVehicles = vehicles.filter(
(vehicle) =>
vehicle.vehicleStatus === "Maintenance"
).length;

const lowBatteryVehicles = vehicles.filter(
(vehicle) =>
vehicle.batteryPercentage < 20
).length;

const filteredVehicles = vehicles.filter(
(vehicle) => {

const matchesSearch =

vehicle.vehicleId
.toLowerCase()
.includes(searchTerm.toLowerCase())

||

vehicle.currentHub
.toLowerCase()
.includes(searchTerm.toLowerCase());

const matchesStatus =

statusFilter === "All"

? true

: vehicle.vehicleStatus === statusFilter;

return matchesSearch && matchesStatus;

});

const deleteVehicle = async (id: string) => {

const confirmDelete = confirm(
"Are you sure you want to delete this vehicle?"
);

if (!confirmDelete) return;

const res = await fetch(`/api/vehicles/${id}`,{
method:"DELETE",
});

const data = await res.json();

if(data.success){

setVehicles(

vehicles.filter(
(vehicle)=>vehicle._id!==id
)

);

alert("Vehicle Deleted Successfully");

}

};

return (

<PageContainer>

<DashboardHeader
title="Fleet Dashboard"
subtitle="Monitor every vehicle, hub, battery status and fleet operation across the complete Kebu One ecosystem."
/>

<KPIGrid>

<KPICard
title="Total Vehicles"
value={totalVehicles}
subtitle="Fleet Registered"
icon="🚲"
color="pink"
/>

<KPICard
title="Available"
value={availableVehicles}
subtitle="Ready for Booking"
icon="✅"
color="green"
/>

<KPICard
title="In Ride"
value={inRideVehicles}
subtitle="Currently Running"
icon="🛣️"
color="blue"
/>

<KPICard
title="Maintenance"
value={maintenanceVehicles}
subtitle="Workshop Queue"
icon="🛠️"
color="yellow"
/>

<KPICard
title="Low Battery"
value={lowBatteryVehicles}
subtitle="Needs Charging"
icon="🔋"
color="red"
/>

</KPIGrid>

<SectionHeader
title="Vehicle Management"
subtitle="Search, filter, edit and manage every vehicle from one place."
/>

<DashboardCard
title="Fleet Vehicles"
subtitle="Live data coming from MongoDB"
>
  <div className="flex flex-col lg:flex-row gap-4 mb-8">

  <input
    type="text"
    placeholder="Search Vehicle ID or Hub..."
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    className="
      flex-1
      h-14
      rounded-2xl
      border
      border-pink-100
      bg-pink-50/40
      px-5
      outline-none
      focus:border-[#FF165E]
      focus:ring-2
      focus:ring-pink-200
      transition
    "
  />

  <select
    value={statusFilter}
    onChange={(e) => setStatusFilter(e.target.value)}
    className="
      h-14
      rounded-2xl
      border
      border-pink-100
      bg-white
      px-5
      outline-none
      focus:border-[#FF165E]
      focus:ring-2
      focus:ring-pink-200
    "
  >
    <option value="All">All Status</option>
    <option value="Available">Available</option>
    <option value="In Ride">In Ride</option>
    <option value="Maintenance">Maintenance</option>
    <option value="Low Battery">Low Battery</option>
  </select>

</div>

<div className="overflow-x-auto rounded-3xl">

  <table className="min-w-full">

    <thead>

      <tr className="border-b border-pink-100 bg-pink-50">

        <th className="text-left px-6 py-5 font-bold text-[#0A1134]">
          Vehicle ID
        </th>

        <th className="text-left px-6 py-5 font-bold text-[#0A1134]">
          Battery
        </th>

        <th className="text-left px-6 py-5 font-bold text-[#0A1134]">
          GPS
        </th>

        <th className="text-left px-6 py-5 font-bold text-[#0A1134]">
          Lock
        </th>

        <th className="text-left px-6 py-5 font-bold text-[#0A1134]">
          Current Hub
        </th>

        <th className="text-left px-6 py-5 font-bold text-[#0A1134]">
          Status
        </th>

        <th className="text-left px-6 py-5 font-bold text-[#0A1134]">
          Actions
        </th>

      </tr>

    </thead>

    <tbody>

      {filteredVehicles.map((vehicle) => (

        <tr
          key={vehicle._id}
          className="
            border-b
            border-pink-50
            hover:bg-pink-50/50
            transition
          "
        >

          <td className="px-6 py-5 font-semibold">
            {vehicle.vehicleId}
          </td>

          <td
            className={`px-6 py-5 font-bold ${
              vehicle.batteryPercentage < 20
                ? "text-red-600"
                : "text-green-600"
            }`}
          >
            {vehicle.batteryPercentage}%
          </td>

          <td className="px-6 py-5">
            {vehicle.gpsStatus}
          </td>

          <td className="px-6 py-5">
            {vehicle.lockStatus}
          </td>

          <td className="px-6 py-5">
            {vehicle.currentHub}
          </td>

          <td className="px-6 py-5">

            {vehicle.vehicleStatus === "Available" && (
              <StatusBadge status="active" />
            )}

            {vehicle.vehicleStatus === "In Ride" && (
              <StatusBadge status="active" />
            )}

            {vehicle.vehicleStatus === "Maintenance" && (
              <StatusBadge status="warning" />
            )}

            {vehicle.vehicleStatus === "Low Battery" && (
              <StatusBadge status="danger" />
            )}

          </td>

          <td className="px-6 py-5">

            <div className="flex flex-wrap gap-3">

              <ActionButton
                onClick={() => setEditingVehicle(vehicle)}
              >
                Edit
              </ActionButton>

              <button
                onClick={() => deleteVehicle(vehicle._id)}
                className="
                  px-6
                  py-3
                  rounded-2xl
                  bg-red-500
                  text-white
                  font-semibold
                  hover:bg-red-600
                  transition
                "
              >
                Delete
              </button>

            </div>

          </td>

        </tr>

      ))}

    </tbody>

  </table>

</div>

</DashboardCard>

{editingVehicle && (

<div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">

<div className="w-full max-w-2xl rounded-[32px] bg-white shadow-2xl border border-pink-100 overflow-hidden">

<div className="px-8 py-6 bg-gradient-to-r from-[#D6006E] via-[#FF165E] to-[#FF5556]">

<h2 className="text-3xl font-black text-white">
Edit Vehicle
</h2>

<p className="text-pink-100 mt-2">
Update vehicle information
</p>

</div>

<div className="p-8 space-y-6">

<div>

<label className="block text-sm font-semibold text-gray-600 mb-2">
Vehicle ID
</label>

<input
type="text"
value={editingVehicle.vehicleId}
onChange={(e)=>
setEditingVehicle({
...editingVehicle,
vehicleId:e.target.value,
})
}
className="w-full h-14 rounded-2xl border border-pink-100 px-5 focus:outline-none focus:border-[#FF165E]"
/>

</div>

<div>

<label className="block text-sm font-semibold text-gray-600 mb-2">
Vehicle Model
</label>

<input
type="text"
value={editingVehicle.vehicleModel}
onChange={(e)=>
setEditingVehicle({
...editingVehicle,
vehicleModel:e.target.value,
})
}
className="w-full h-14 rounded-2xl border border-pink-100 px-5 focus:outline-none focus:border-[#FF165E]"
/>

</div>

<div>

<label className="block text-sm font-semibold text-gray-600 mb-2">
Battery Percentage
</label>

<input
type="number"
value={editingVehicle.batteryPercentage}
onChange={(e)=>
setEditingVehicle({
...editingVehicle,
batteryPercentage:Number(e.target.value),
})
}
className="w-full h-14 rounded-2xl border border-pink-100 px-5 focus:outline-none focus:border-[#FF165E]"
/>

</div>

<div>

<label className="block text-sm font-semibold text-gray-600 mb-2">
Vehicle Status
</label>

<select
value={editingVehicle.vehicleStatus}
onChange={(e)=>
setEditingVehicle({
...editingVehicle,
vehicleStatus:e.target.value,
})
}
className="w-full h-14 rounded-2xl border border-pink-100 px-5 focus:outline-none focus:border-[#FF165E]"
>

<option>Available</option>

<option>In Ride</option>

<option>Maintenance</option>

<option>Low Battery</option>

</select>

</div>

<div className="flex flex-col sm:flex-row gap-4 pt-4">

  <ActionButton
onClick={async()=>{

await fetch(
`/api/vehicles/${editingVehicle._id}`,
{
method:"PATCH",
headers:{
"Content-Type":"application/json",
},
body:JSON.stringify(editingVehicle),
}
);

window.location.reload();

}}
>
Save Changes
</ActionButton>

<button
onClick={()=>setEditingVehicle(null)}
className="
flex-1
h-14
rounded-2xl
border
border-gray-300
font-semibold
hover:bg-gray-100
transition
"
>
Cancel
</button>

</div>

</div>

</div>

</div>

)}

</PageContainer>

);

}