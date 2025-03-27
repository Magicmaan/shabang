import {
    LucideIcon,
    AppWindow,
    MonitorCog,
    FolderClosed,
    File,
    Film,
    CassetteTape,
    Image,
    ImagePlay,
    FileText,
    FileJson,
    FileArchive,
    FolderArchive,
    FileCode,
    LucideProps,
    FileCog,
} from 'lucide-react'

import OfficeWord from '@/assets/icons/office/office_word.svg?react'
import OfficePowerpoint from '@/assets/icons/office/office_powerpoint.svg?react'
import OfficeExcel from '@/assets/icons/office/office_excel.svg?react'
import OfficeAccess from '@/assets/icons/office/office_access.svg?react'
import OfficeOutlook from '@/assets/icons/office/office_outlook.svg?react'
import OfficeOnenote from '@/assets/icons/office/office_onenote.svg?react'
import OfficePublisher from '@/assets/icons/office/office_publisher.svg?react'
import Google from '@/assets/icons/google.svg?react'

const customProps = {
    width: 24,
    height: 24,
}

export const fileIcons: { [key: string]: any } = {
    default: (props: LucideProps) => <File {...props} />,
    exe: (props: LucideProps) => <AppWindow {...props} />,
    lnk: (props: LucideProps) => <AppWindow {...props} />,
    setting: (props: LucideProps) => <MonitorCog {...props} />,
    txt: (props: LucideProps) => <FileText {...props} />,
    file: (props: LucideProps) => <File {...props} />,
    folder: (props: LucideProps) => <FolderClosed {...props} />,
    dll: (props: LucideProps) => <FileCog {...props} />,

    // archive
    zip: (props: LucideProps) => <FolderArchive {...props} />,
    rar: (props: LucideProps) => <FolderArchive {...props} />,
    tar: (props: LucideProps) => <FolderArchive {...props} />,
    gz: (props: LucideProps) => <FolderArchive {...props} />,

    // video
    mp4: (props: LucideProps) => <Film {...props} />,
    mkv: (props: LucideProps) => <Film {...props} />,
    avi: (props: LucideProps) => <Film {...props} />,
    mov: (props: LucideProps) => <Film {...props} />,
    wmv: (props: LucideProps) => <Film {...props} />,
    flv: (props: LucideProps) => <Film {...props} />,
    webm: (props: LucideProps) => <Film {...props} />,
    mpeg: (props: LucideProps) => <Film {...props} />,

    // audio
    mp3: (props: LucideProps) => <CassetteTape {...props} />,
    wav: (props: LucideProps) => <CassetteTape {...props} />,
    flac: (props: LucideProps) => <CassetteTape {...props} />,
    aac: (props: LucideProps) => <CassetteTape {...props} />,
    wma: (props: LucideProps) => <CassetteTape {...props} />,
    adt: (props: LucideProps) => <CassetteTape {...props} />,
    aif: (props: LucideProps) => <CassetteTape {...props} />,
    aiff: (props: LucideProps) => <CassetteTape {...props} />,
    aifc: (props: LucideProps) => <CassetteTape {...props} />,
    cda: (props: LucideProps) => <CassetteTape {...props} />,
    ogg: (props: LucideProps) => <CassetteTape {...props} />,

    // image
    png: (props: LucideProps) => <Image {...props} />,
    jpg: (props: LucideProps) => <Image {...props} />,
    jpeg: (props: LucideProps) => <Image {...props} />,
    bmp: (props: LucideProps) => <Image {...props} />,

    // moving image
    gif: (props: LucideProps) => <ImagePlay {...props} />,
    webp: (props: LucideProps) => <ImagePlay {...props} />,

    // MS office
    doc: (props: React.SVGProps<SVGSVGElement>) => (
        <OfficeWord {...customProps} {...props} />
    ),
    docx: (props: React.SVGProps<SVGSVGElement>) => (
        <OfficeWord {...customProps} {...props} />
    ),
    ppt: (props: React.SVGProps<SVGSVGElement>) => (
        <OfficePowerpoint {...customProps} {...props} />
    ),
    pptx: (props: React.SVGProps<SVGSVGElement>) => (
        <OfficePowerpoint {...customProps} {...props} />
    ),
    pps: (props: React.SVGProps<SVGSVGElement>) => (
        <OfficePowerpoint {...customProps} {...props} />
    ),
    ppsx: (props: React.SVGProps<SVGSVGElement>) => (
        <OfficePowerpoint {...customProps} {...props} />
    ),
    xls: (props: React.SVGProps<SVGSVGElement>) => (
        <OfficeExcel {...customProps} {...props} />
    ),
    xlsx: (props: React.SVGProps<SVGSVGElement>) => (
        <OfficeExcel {...customProps} {...props} />
    ),
    accdb: (props: React.SVGProps<SVGSVGElement>) => (
        <OfficeAccess {...customProps} {...props} />
    ),
    mdb: (props: React.SVGProps<SVGSVGElement>) => (
        <OfficeAccess {...customProps} {...props} />
    ),
    pst: (props: React.SVGProps<SVGSVGElement>) => (
        <OfficeOutlook {...customProps} {...props} />
    ),
    ost: (props: React.SVGProps<SVGSVGElement>) => (
        <OfficeOutlook {...customProps} {...props} />
    ),
    one: (props: React.SVGProps<SVGSVGElement>) => (
        <OfficeOnenote {...customProps} {...props} />
    ),
    pub: (props: React.SVGProps<SVGSVGElement>) => (
        <OfficePublisher {...customProps} {...props} />
    ),

    // code
    json: (props: LucideProps) => <FileJson {...props} />,
    js: (props: LucideProps) => <FileCode {...props} />,
    ts: (props: LucideProps) => <FileCode {...props} />,
    jsx: (props: LucideProps) => <FileCode {...props} />,
    tsx: (props: LucideProps) => <FileCode {...props} />,
    py: (props: LucideProps) => <FileCode {...props} />,
    c: (props: LucideProps) => <FileCode {...props} />,
    cpp: (props: LucideProps) => <FileCode {...props} />,
    h: (props: LucideProps) => <FileCode {...props} />,
    hpp: (props: LucideProps) => <FileCode {...props} />,
    cs: (props: LucideProps) => <FileCode {...props} />,
    java: (props: LucideProps) => <FileCode {...props} />,
    php: (props: LucideProps) => <FileCode {...props} />,
    html: (props: LucideProps) => <FileCode {...props} />,
    css: (props: LucideProps) => <FileCode {...props} />,
    scss: (props: LucideProps) => <FileCode {...props} />,
    sass: (props: LucideProps) => <FileCode {...props} />,
    rs: (props: LucideProps) => <FileCode {...props} />,
    go: (props: LucideProps) => <FileCode {...props} />,
    rb: (props: LucideProps) => <FileCode {...props} />,
    sh: (props: LucideProps) => <FileCode {...props} />,

    // bangs
    google: (props: React.SVGProps<SVGSVGElement>) => (
        <Google {...customProps} {...props} />
    ),
}
