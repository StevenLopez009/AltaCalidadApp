import CompanyForm from "@/src/modules/company/components/CompanyForm";
import CompanyList from "@/src/modules/company/components/CompanyList";

export default function CompaniesPage() {
  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-8 p-8">
      <CompanyForm />
      <CompanyList />
    </div>
  );
}
