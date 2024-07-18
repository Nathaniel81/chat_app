import { Skeleton } from "../ui/skeleton";

const MessageSkeleton = () => {
  return (
    <div className='p-4 space-y-2'>
      <div className='flex gap-3 items-center'>
        <div className='skeleton w-10 h-10 rounded-full shrink-0'></div>
        <div className='flex gap-2'>
          <Skeleton className='h-12 w-12 rounded-full mt-auto' />
          <Skeleton className='w-40 h-16' />
        </div>
      </div>
      <div className='flex gap-3 items-center justify-end '>
        <div className='skeleton w-10 h-10 rounded-full shrink-0'></div>
        <div className='flex gap-2'>
          <Skeleton className='w-40 h-16' />
          <Skeleton className='h-12 w-12 rounded-full mt-auto' />
        </div>
      </div>
    </div>
  );
};

export default MessageSkeleton;
