const Profile = ({profileView}) => {
  return (
    <div className='bg-white p-4 flex items-center'>
      <div className='rounded-full w-16 h-16 bg-gray-300 overflow-hidden'>
        <img
          src={
            'https://images.unsplash.com/photo-1529665253569-6d01c0eaf7b6?auto=format&fit=crop&q=80&w=1985&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
          }
          alt='Profile Pic'
          className='object-cover w-full h-full'
        />
      </div>
      <div className='ml-4'>
        <h1 className='text-2xl font-bold'>{profileView.Username}</h1>
      </div>
    </div>
  )
}

export default Profile
