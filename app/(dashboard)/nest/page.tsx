import { NestChat } from '@/components/nest/NestChat'

export default function NestPage() {
  return (
    <div className="h-screen lg:h-[calc(100vh)] flex flex-col">
      <NestChat />
    </div>
  )
}
