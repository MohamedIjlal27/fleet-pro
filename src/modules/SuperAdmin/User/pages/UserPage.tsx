export const UserPage = () => {
    console.log("UserPage");
  return (
    <div className='flex flex-col gap-4'>
        <h1 className='text-2xl font-bold'>Users</h1>
        <div className='flex flex-col gap-4'>
            <div className='flex flex-col gap-2'>
                <h2 className='text-lg font-bold'>Users</h2>
                <p className='text-sm text-gray-500'>Manage users in the system</p>
            </div>
        </div>
    </div>
  )
}
