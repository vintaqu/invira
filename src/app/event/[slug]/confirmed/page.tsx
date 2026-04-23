import { Suspense } from 'react'
import ConfirmedClient from './client'

interface Props { params: Promise<{ slug: string }> }

export default async function ConfirmedPage({ params }: Props) {
  const { slug } = await params
  return (
    <Suspense fallback={<div style={{ minHeight:'100vh', background:'#0f0c0a' }} />}>
      <ConfirmedClient slug={slug} />
    </Suspense>
  )
}
