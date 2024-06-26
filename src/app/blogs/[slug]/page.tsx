import Tag from '@src/components/elements/Tag';
import { allBlogs, ImageFieldData } from '@contentlayer/generated';
import Image from 'next/image';
import BlogDetails from '@src/components/blog/BlogDetails';
import RenderMdx from '@src/components/blog/RenderMdx';
import { slug } from 'github-slugger';
// eslint-disable-next-line @typescript-eslint/no-var-requires, import/extensions
const siteMetadata = require('../../../utils/siteMetaData.ts');

export async function generateStaticParams() {
   return allBlogs.map(blog => ({ slug: blog._raw.flattenedPath }));
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
   const blog = allBlogs.find(pageBlog => pageBlog._raw.flattenedPath === params.slug);
   if (!blog) {
      return;
   }

   const publishedAt = new Date(blog.publishedAt).toISOString();
   const modifiedAt = new Date(blog.updatedAt || blog.publishedAt).toISOString();

   let imageList: string[] | ImageFieldData[] = [siteMetadata.socialBanner];
   if (blog.image) {
      imageList = [siteMetadata.siteUrl + blog.image.filePath.replace('../public', '')];
   }
   // const ogImages = imageList.map(img => {
   //    return { url: img.includes('http') ? img : siteMetadata.siteUrl + img };
   // });
   const authors = [blog.author];

   return {
      title: blog.title,
      description: blog.description,
      openGraph: {
         title: blog.title,
         description: blog.description,
         url: siteMetadata.siteUrl + blog.url,
         siteName: siteMetadata.title,
         images: imageList,
         locale: 'en_US',
         type: 'article',
         publishedTime: publishedAt,
         modifiedTime: modifiedAt,
         authors: authors.length > 0 ? authors : [siteMetadata.author],
      },
      twitter: {
         card: 'summary_large_image',
         title: blog.title,
         description: blog.description,
         images: imageList,
      },
   };
}

export default function BlogPage({ params }: { params: { slug: string } }) {
   const blog = allBlogs.find(pageBlog => pageBlog._raw.flattenedPath === params.slug);
   if (!blog) return <div>No blog was found for this url.</div>;

   let imageList: string[] | ImageFieldData[] = [siteMetadata.socialBanner];
   if (blog.image) imageList = [siteMetadata.siteUrl + blog.image.filePath.replace('../public', '')];

   const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'NewsArticle',
      headline: blog.title,
      description: blog.description,
      image: imageList,
      datePublished: new Date(blog.publishedAt).toISOString(),
      dateModified: new Date(blog.updatedAt || blog.publishedAt).toISOString(),
      author: [
         {
            '@type': 'Person',
            name: blog?.author ? [blog.author] : siteMetadata.author,
            url: siteMetadata.siteUrl,
         },
      ],
   };

   return (
      <>
         <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
         <article>
            <div className="mb-8 text-center relative w-full h-[70vh] bg-dark">
               <div className="w-full z-10 flex flex-col items-center justify-center absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <Tag
                     name={blog?.tags[0] ?? ''}
                     link={`/categories/${slug(blog?.tags[0] ?? '')}`}
                     className="px-6 text-sm py-2"
                  />
                  <h1 className="inline-block mt-6 font-semibold capitalize text-light text-2xl md:text-3xl lg:text-5xl leading-normal relative w-5/6">
                     {blog?.title}
                  </h1>
               </div>
               <div className="absolute top-0 left-0 right-0 bottom-0 h-full bg-dark/30" />
               <Image
                  src={blog?.image?.filePath.replace('../public', '') ?? ''}
                  placeholder="blur"
                  blurDataURL={blog?.image?.blurhashDataUrl}
                  alt={blog?.title ?? ''}
                  width={blog?.image?.width}
                  height={blog?.image?.height}
                  className="aspect-square w-full h-full object-cover object-center group-hover:scale-105 transition-all ease duration-300"
                  priority
                  sizes="100vw"
               />
            </div>
            <div className="grid grid-cols-12 px-5 md:px-10 mb-20">
               <div className="col-span-12">
                  <BlogDetails blog={blog!} slug={params.slug} />
               </div>
               <div className="mt-4 col-span-12 lg:col-span-8 lg:col-start-3">
                  <RenderMdx blog={blog!} />
               </div>
            </div>
         </article>
      </>
   );
}
