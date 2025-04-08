import Link from 'next/link'
import { APP_NAME } from '@/app/constants'
import { BellIcon, UserCircleIcon, Bars3Icon } from '@heroicons/react/24/outline'

interface DashboardNavbarProps {
  setMobileMenuOpen: (open: boolean) => void
}

export default function DashboardNavbar({ setMobileMenuOpen }: DashboardNavbarProps) {
  return (
    <nav className="bg-white shadow-sm fixed w-full z-30">
      <div className="px-4 h-16 flex items-center justify-between">
        <div className="flex items-center">
          <button
            type="button"
            className="md:hidden -ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900"
            onClick={() => setMobileMenuOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          </button>
          <Link href="/dashboard" className="text-xl font-bold text-[#31BCFF] ml-2 md:ml-0">
            {APP_NAME}
          </Link>
        </div>

        <div className="flex items-center space-x-4">
          <button className="p-2 text-gray-600 hover:text-[#31BCFF] rounded-full">
            <BellIcon className="h-6 w-6" />
          </button>
          <div className="flex items-center space-x-3 border-l pl-4">
            <UserCircleIcon className="h-8 w-8 text-gray-600" />
            <div className="hidden md:block">
              <p className="text-sm font-medium text-gray-900">Admin User</p>
              <p className="text-xs text-gray-500">admin@company.com</p>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}