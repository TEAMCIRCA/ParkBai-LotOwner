using System.Web;
using System.Web.Mvc;

namespace ParkBai_Lot_Owner
{
    public class FilterConfig
    {
        public static void RegisterGlobalFilters(GlobalFilterCollection filters)
        {
            filters.Add(new HandleErrorAttribute());
        }
    }
}
