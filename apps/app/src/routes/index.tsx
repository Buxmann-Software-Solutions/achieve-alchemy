import { createFileRoute } from '@tanstack/react-router'
import { PageLayout } from '@/components/layouts/page-layout'
import { HabitCard, LoadingHabitCard } from '@/components/habit/habit-card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { AddHabitButton } from '@/components/habit/add-habit-button'
import { useGetArchivedHabits } from '@/hooks/habit/use-get-archived-habits'
import { useGetActiveHabits } from '@/hooks/habit/use-get-active-habits'

export const Route = createFileRoute('/')({
  component: HabitPage,
})

enum HabitTabType {
  ACTIVE = 'active',
  ARCHIVED = 'archived',
}

function HabitPage() {
  return (
    <PageLayout title="Habits" subTitle="Your daily building blocks">
      <HabitsSection />
    </PageLayout>
  )
}

function HabitsSection() {
  const [selectedTab, setSelectedTab] = useState<string>(HabitTabType.ACTIVE)
  const tabTypes = Object.values(HabitTabType)

  return (
    <Tabs
      key={selectedTab}
      value={selectedTab}
      defaultValue={HabitTabType.ACTIVE}
      onValueChange={(value) => setSelectedTab(value)}
    >
      <div className="flex items-center justify-between space-x-5">
        <TabsList className="w-fit min-w-[200px]">
          {tabTypes.map((tabType) => (
            <TabsTrigger
              key={tabType}
              value={tabType}
              className="capitalize flex-1"
              aria-selected={selectedTab === tabType}
            >
              {tabType}
            </TabsTrigger>
          ))}
        </TabsList>
        <AddHabitButton />
      </div>
      <div className="my-2 h-[85vh] overflow-y-scroll [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <TabsContent value={HabitTabType.ACTIVE}>
          <ActiveHabitCardsTab />
        </TabsContent>
        <TabsContent value={HabitTabType.ARCHIVED}>
          <ArchivedHabitCardsTab />
        </TabsContent>
      </div>
    </Tabs>
  )
}

function ActiveHabitCardsTab() {
  const { data, isLoading, isError, refetch } = useGetActiveHabits()

  if (isError) {
    return (
      <div className="h-[200px] space-y-4 flex flex-col items-center justify-center">
        <h4>Failed loading active cards...</h4>
        <Button onClick={() => refetch()} className="w-[100px]">
          Try again
        </Button>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="w-full grid md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <LoadingHabitCard key={index} />
        ))}
      </div>
    )
  }

  const activeHabits = data ?? []

  return (
    <div className="w-full grid md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
      {activeHabits.map((habit) => (
        <HabitCard key={habit.id} habit={habit} />
      ))}
    </div>
  )
}

function ArchivedHabitCardsTab() {
  const { data, isLoading, isError, refetch } = useGetArchivedHabits()

  if (isError) {
    return (
      <div className="h-[200px] space-y-4 flex flex-col items-center justify-center">
        <h4>Failed loading archived cards...</h4>
        <Button onClick={() => refetch()} className="w-[100px]">
          Try again
        </Button>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="w-full grid md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <LoadingHabitCard key={index} />
        ))}
      </div>
    )
  }

  const archivedHabits = data ?? []

  return (
    <div className="w-full grid md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
      {archivedHabits.map((habit) => (
        <HabitCard key={habit.id} habit={habit} />
      ))}
    </div>
  )
}
