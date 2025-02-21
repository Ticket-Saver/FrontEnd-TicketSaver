import { useAuth0 } from '@auth0/auth0-react'

export default function MyProfile() {
  const { user } = useAuth0()
  return (
    <div className="bg-blue-gray-800 text-white px-8 py-12 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-4">My Profile</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
        <p className="text-sm font-medium">Email:</p>
        <p className="text-gray-300">{user?.email || 'Not provided'}</p>
        <p className="text-sm font-medium">Phone:</p>
        <p className="text-gray-300">{user?.phone_number || 'Not provided'}</p>
        <p className="text-sm font-medium">sub id:</p>
        <p className="text-gray-300">{user?.sub || 'Guest'}</p>
      </div>
    </div>
  )
}
