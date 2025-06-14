import { cn } from "@/lib/utils";

function PageHeader({
	className,
	children,
	...props
}: React.HTMLAttributes<HTMLDivElement>) {
	return (
		<section
			className={cn(
				"flex flex-col gap-2 pb-4 md:flex-row md:items-center md:justify-between",
				className
			)}
			{...props}
		>
			{children}
		</section>
	);
}

function PageHeaderHeading({
	className,
	...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
	return (
		<h1
			className={cn(
				"text-3xl font-bold leading-tight tracking-tighter md:text-4xl",
				className
			)}
			{...props}
		/>
	);
}

function PageHeaderDescription({
	className,
	...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
	return <p className={cn("text-muted-foreground", className)} {...props} />;
}

export { PageHeader, PageHeaderHeading, PageHeaderDescription };
