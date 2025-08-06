interface SidebarSettingProps {
    open: boolean

}

const SidebarSetting: React.FC<SidebarSettingProps> = ({ open }) => {
    if (!open) return;
    return (
        <div className="">

        </div>
    )
}


export default SidebarSetting;
