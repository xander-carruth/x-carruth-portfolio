import { Blog } from '@contentlayer/generated';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import Tag from '../elements/Tag';
import { format } from 'date-fns';

const BlogLayoutTwo: React.FC<{ blog: Blog }> = ({ blog }) => {
   return (
      <div className="group grid grid-cols-12 sm:gap-4 items-center border border-salo-violet rounded-xl">
         <Link href={blog.url} className="col-span-12 lg:col-span-4 h-full rounded-t-xl sm:rounded-xl overflow-hidden">
            <Image
               src={blog.image?.filePath.replace('../public', '') ?? ''}
               placeholder="blur"
               blurDataURL={blog.image?.blurhashDataUrl}
               alt={blog.title}
               width={blog.image?.width}
               height={blog.image?.height}
               className="aspect-square w-full h-full object-cover object-center group-hover:scale-105 transition-all ease duration-300"
            />
         </Link>
         <div className="col-span-12 lg:col-span-8 w-full p-4 sm:p-0">
            <span className="inline-block w-full uppercase text-accent font-semibold text-xs sm:text-sm">
               {blog.tags?.[0]}
            </span>
            <Link href={blog.url} className="inline-block my-1">
               <h2 className="font-bold capitalize text-base sm:text-lg">
                  <span className="text-light bg-gradient-to-r from-accent/50 to-accent/50 bg-[length:0px_6px] group-hover:bg-[length:100%_6px] bg-left-bottom bg-no-repeat transition-[background-size] duration-500">
                     {blog.title}
                  </span>
               </h2>
            </Link>
            <span className="inline-block w-full capitalize text-light/50 font-semibold text-sm sm:text-base">
               {format(new Date(blog.publishedAt), 'MMMM dd yyyy')}
            </span>
         </div>
      </div>
   );
};

export default BlogLayoutTwo;
