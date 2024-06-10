import { Blog } from '@contentlayer/generated';
import { sortBlogs } from '@src/utils';
import React from 'react';
import BlogLayoutOne from '../blog/BlogLayoutOne';
import BlogLayoutTwo from '../blog/BlogLayoutTwo';
import Link from 'next/link';
import BlogLayoutThree from '../blog/BlogLayoutThree';

type RecentPostsProps = {
   blogs: Blog[];
};

const RecentPosts: React.FC<RecentPostsProps> = ({ blogs }) => {
   const sortedBlogs = sortBlogs(blogs);

   return (
      <section className="w-full mt-12 sm:mt-18 md:mt-24 px-5 sm:px-10 md:px-24 sxl:px-32 flex flex-col items-center justify-center">
         <div className="w-full flex justify-between">
            <h2 className="w-fit inline-block font-bold capitalize text-2xl md:text-4xl text-light">Recent Posts</h2>
            <Link
               href="/categories/all"
               className="inline-block font-medium text-accent underline underline-offset-2 text-base md:text-lg">
               view all
            </Link>
         </div>
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 grid-rows-2 gap-6 sm:gap-16 mt-6 sm:mt-8">
            {sortedBlogs.slice(0, 6).map((blog, index) => {
               return (
                  <article className="col-span-1 row-span-1 relative">
                     <BlogLayoutThree blog={blog} />
                  </article>
               );
            })}
         </div>
      </section>
   );
};

export default RecentPosts;
